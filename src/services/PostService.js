import RequestService from './RequestService';
import LoggingService from './LoggingService';
import Constants from '../common/constants';
import AuthService from './AuthService';
import ChainService from './ChainService';
import CommentService from './CommentService';
import Utils from '../utils/Utils';
import storage from '../utils/Storage';

class PostService {

	static getPostsList(url, offset, show_nsfw = 0, show_low_rated = 0, limit, currentOptions) {
		const options = {
			offset,
			show_nsfw,
			show_low_rated,
			limit,
			username: AuthService.getUsername(),
			...currentOptions
		};
		return RequestService.get(url, options);
	}

	static getPost(postUrl) {
		const url = `post/${PostService.getUsernameFromUrl(postUrl)}/${PostService.getPermlinkFromUrl(postUrl)}/info`;
		const options = {
			show_nsfw: true,
			show_low_rated: true,
			username: AuthService.getUsername()
		};
		return RequestService.get(url, options);
	}

	static changeVote(postAuthor, permlink, voteStatus, power) {
		return ChainService.changeVoteInBlockchain(postAuthor, permlink, voteStatus ? power : 0)
			.then(response => {
				LoggingService.logVote(voteStatus, permlink, postAuthor);
				return Promise.resolve(response);
			})
			.catch(error => {
				LoggingService.logVote(voteStatus, permlink, postAuthor, error);
				return Promise.reject(error);
			})
	}

	static changeFlag(postAuthor, permlink, isFlag, power = -10000) {
		return ChainService.changeVoteInBlockchain(postAuthor, permlink, isFlag ? power : 0)
			.then(response => {
				LoggingService.logFlag(isFlag, permlink, postAuthor);
				return Promise.resolve(response);
			})
			.catch(error => {
				LoggingService.logFlag(isFlag, permlink, postAuthor, error);
				return Promise.reject(error);
			})
	}

	static createPost(tags, title, description, file) {
		tags = getValidTags(tags);
		const permlink = PostService.createPostPermlink(title);
		const operation = getDefaultPostOperation(title, tags, description, permlink);

		return fileUpload(file)
			.then(media => {
				return preparePost(tags, description, permlink, [media]);
			})
			.then(prepareData => {
				let beneficiaries = ChainService.getBeneficiaries(permlink, prepareData.beneficiaries);
				let plagiarism = prepareData['is_plagiarism'];
				operation[1].body = prepareData.body;
				operation[1].json_metadata = JSON.stringify(prepareData.json_metadata);
				const operations = [operation, beneficiaries];
				if (plagiarism['is_plagiarism']) {
					let data = {
						ipfs: prepareData.json_metadata['ipfs_photo'],
						media: prepareData.json_metadata.media[0],
						plagiarism_author: plagiarism['plagiarism_username'],
						plagiarism_permlink: plagiarism.plagiarism_permlink,
						operations
					};
					return Promise.reject(data);
				}
				return PostService.afterCheckingPlagiarism(operations)
			})
	}

	static afterCheckingPlagiarism(operations) {
		return ChainService.addPostDataToBlockchain(operations)
			.then(response => {
				LoggingService.logPost();
				return Promise.resolve(response);
			})
			.catch(error => {
				return Promise.reject(error);
			})
	}

	static editPost(title, tags, description, permlink, media) {
		tags = getValidTags(tags);
		const operation = getDefaultPostOperation(title, tags, description, permlink);
		return preparePost(tags, description, permlink, [media])
			.then(response => {
				operation[1].body = response.body;
				operation[1].json_metadata = JSON.stringify(response.json_metadata);
				const operations = [operation];
				return ChainService.addPostDataToBlockchain(operations)
			})
			.then(response => {
				LoggingService.logEditPost(permlink);
				return Promise.resolve(response);
			})
			.catch(error => {
				LoggingService.logEditPost(permlink, error);
				return Promise.reject(error);
			})
	}

	static deletePost(post, isComment) {
		const permlink = PostService.getPermlinkFromUrl(post.url);
		return ChainService.deletePostFromBlockchain(permlink)
			.catch((error) => {
			console.log(error.message);
				let operation = getDefaultPostOperation(post.title, post.tags, post.description, permlink);
				if (!isComment) {
					operation[1].title = '*deleted*';
					operation[1].body = '*deleted*';
					if (post.json_metadata.tags.length > 2) {
						post.json_metadata.tags.splice(1, post.json_metadata.tags.length - 2);
					}
					operation[1].json_metadata = JSON.stringify(post.json_metadata);
				}
				if (isComment) {
					operation = CommentService.getDefaultCommentOperation(post.parent_author, post.parent_permlink, post.author,
						permlink, '*deleted*');
				}
				return ChainService.addPostDataToBlockchain([operation]);
			})
			.then(response => {
				LoggingService.logDeletedPost(permlink);
				return Promise.resolve(response);
			})
			.catch(error => {
				LoggingService.logDeletedPost(permlink, error);
				return Promise.reject(error);
			})
	}

	static createPostPermlink(permlinkHead) {
		const today = new Date();
		const permlinkHeadLimit = 30;
		permlinkHead = permlinkHead.toLowerCase();
		permlinkHead = Utils.detransliterate(permlinkHead, true);
		if (permlinkHead.length > permlinkHeadLimit) {
			permlinkHead = permlinkHead.slice(0, permlinkHeadLimit + 1);
		}
		return permlinkHead.replace(/\W/g, '-') + '-' + today.getFullYear() + '-' + today.getMonth() + '-' + today.getDay()
			+ '-' + today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds();
	}

	static getPermlinkFromUrl(url) {
		const elements = url.split('/');
		return elements[elements.length - 1];
	}

	static getUsernameFromUrl(url) {
		const elements = url.split('/');
		return elements[elements.length - 2];
	}
}

export default PostService;

function preparePost(tags, description, permlink, media) {
	const url = 'post/prepare';
	const data = {
		username: AuthService.getUsername(),
		tags: tags,
		description: description,
		post_permlink: `@${AuthService.getUsername()}/${permlink}`,
		media: media,
		show_footer: true,
		device: 'web'
	};
	return RequestService.post(url, data);
}


function getValidTags(tags) {
	if (!tags) {
		tags = 'steepshot';
	}
	tags = tags.split(' ');
	tags = removeEmptyTags(tags);
	tags = tags.map(tag => Utils.detransliterate(tag, true));
	return tags;
}

function removeEmptyTags(tags) {
	let empty = tags.indexOf('');
	while (empty !== -1) {
		tags.splice(empty, 1);
		empty = tags.indexOf('');
	}
	return tags;
}

function getDefaultPostOperation(title, tags, description, permlink) {
	const category = tags[0];
	return [Constants.OPERATIONS.COMMENT, {
		parent_author: '',
		parent_permlink: category,
		author: AuthService.getUsername(),
		permlink,
		title,
		description,
		body: 'empty',
		json_metadata: {
			tags: tags,
			app: 'steepshot'
		}
	}]
}

function fileUpload(file) {
	const accessToken = storage.accessToken;
	const url = 'media/upload';
	if (accessToken) {
    let form = new FormData();
    form.append('file', file);
    form.append('access_token', accessToken);
    form.append('username', storage.username);
    return RequestService.post(url, form);
	}
	return ChainService.getValidTransaction()
		.then(transaction => {
			let form = new FormData();
			form.append('file', file);
			form.append('trx', JSON.stringify(transaction));
			return RequestService.post(url, form);
		})
}