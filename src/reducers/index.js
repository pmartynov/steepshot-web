import {combineReducers} from 'redux';
import auth from './auth';
import posts from './posts';
import clipboard from './clipboard';
import usersList from './usersList';
import postsList from './postsList';
import modals from './modals';
import postModal from './postModal';
import tabsBar from './tabsBar';
import likesFlagsList from './likesFlagsList';
import users from './users';
import textInput from './textInput';
import metaTags from './metaTags';
import search from './search';
import editPost from './editPost';
import avatar from './avatar';
import {routerReducer} from 'react-router-redux';
import pushNotifications from './pushNotifications';
import comments from './comments';
import imagesGallery from './imagesGallery';
import userProfile from './userProfile';
import pushMessage from './pushMessage';
import formInput from './formInput';
import bodyLoader from './bodyLoader';
import session from './session';
import windowOnStore from './windowOnStore';
import settings from './settings';
import mobileNavigation from './mobileNavigation';
import oneSignal from './oneSignal';
import settingsFields from './settingsFields';
import advertising from './advertising';
import services from './services';
import login from './login';
import scroll from './scroll';
import promoteModal from './promoteModal';
import images from './images';
import emptyRequestError from './emptyRequestError';
import transactionHistory from './transactionHistory';
import contextMenu from './contextMenu';
import transfer from './transfer';
import activeKey from './activeKey';
import power from './power';
import wallet from './wallet';

export default combineReducers({
	clipboard,
	auth,
	posts,
	tabsBar,
	postsList,
	usersList,
	modals,
	postModal,
	users,
	likesFlagsList,
	editPost,
	textInput,
	avatar,
	metaTags,
	search,
	pushNotifications,
	router: routerReducer,
	comments,
	imagesGallery,
	userProfile,
	pushMessage,
	formInput,
	bodyLoader,
	session,
	window: windowOnStore,
	settings,
	settingsFields,
	mobileNavigation,
	advertising,
	oneSignal,
	services,
	login,
	scroll,
	promoteModal,
	images,
	emptyRequestError,
	transactionHistory,
	contextMenu,
	transfer,
	activeKey,
	power,
	wallet
});
