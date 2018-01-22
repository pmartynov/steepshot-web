export default {
    URLS: {
        baseUrl_v1_1: 'https://steepshot.org/api/v1_1',
        baseUrl_v1: 'https://steepshot.org/api/v1',
    },
    CATEGORIES: {
        user: 'user',
        tag: 'tag'
    },
    OPERATIONS: {
        COMMENT: 'comment',
        VOTE: 'vote',
        POST: 'post',
        FOLLOW: 'follow',
        COMMENT_OPTIONS: 'comment_options',
        FLAG: 'flag'
    },
    STEEM_PATLOAD: {
        MAX_ACCEPTED_PAYOUT: '1000000.000 SBD',
        PERCENT_STEMM_DOLLARS: 10000
    },
    NO_AVATAR: '/static/images/person.png',
    NO_IMAGE: '/static/images/noimage.jpg',

    SETTINGS: {
        show_low_rated : "show_low_rated",
        show_nsfw : "show_nsfw"
    },

    SETTINGS_LABELS : {
        save : 'Save',
        succesSave : 'Saved',
        upToDate : 'Already up to date'
    },

    POSTS_SETTINGS: {
        defaultLimit: 17
    },

    EMPTY_QUERY : "It's very strange, but we do not have anything yet for this query. Try to look for something else ...",
    EMPTY_QUERY_VOTERS : "Still no one has rated this post ...",

    SEARCH_PLACEHOLDER : "Type your search query and press \"Enter\"",
    SEARCH_PLACEHOLDER_MIN : "To search, press \"Enter\"",

    POSTS_FILTERS: {
        POSTS_TOP : {
            label : 'Top',
            point : 'posts/top' //Can be updated by category
        },
        POSTS_HOT : {
            label : 'Hot',
            point : 'posts/hot' //Can be updated by category
        },
        POSTS_NEW : {
            label : 'New',
            point : 'posts/new' //Can be updated by category
        },
        POSTS_USER_FEED : {
            label : 'Feed',
            point : 'recent/posts'
        },
        POSTS_USER : {
            label : 'Posts',
            point : 'user/posts' //Should been updated by username
        }
    },

    USERS_FILTERS : {
        FOLLOWERS : {
            label : 'Followers',
            point : 'user/followers' //Should been updated by username
        },
        FOLLOWING : {
            label : 'Following',
            point : 'user/following' //Should been updated by username
        }
    },

    LIKES_FILTER : {
        LIKE : {
           label : 'Liked by'
        },
        DISLIKE : {
           label : 'Flaged by'
        }
    },

    SEARCH_FILTERS : {
        USERS : {
            label : 'Users',
            point : 'user/search'
        },
        CATEGORIES : {
            label : 'Tag',
            point : 'categories/search'
        }
    },

    SEARCH_HEADING_LABELS : {
        USERS_RESULT : 'User search results for ',
        NEW_POSTS_RESULT : 'New posts by tag ',
        HOT_POSTS_RESULT : 'Hot posts by tag '
    },

    PROMISES : {
        GET_COMMENTS : 'GET_COMMENTS_PROMISE',
        GET_POSTS : 'GET_POSTS_PROMISE',
        GET_FOLLOWERS : 'GET_FOLLOWERS_PROMISE',
        GET_FOLLOWING : 'GET_FOLLOWING_PROMISE',
        GET_USERS_SEARCH : 'GET_USERS_SEARCH'
    },

    DISPLAY : {
        DESK_BREAKPOINT : 1024
    },

    CURRENCY: '$',

    ENDLESS_SCROLL : {
        DEBOUNCE : 500,
        OFFSET : 1500
    },

    TUTORIAL : {
        PRE_TEXT : 'Also you can check ',
        TEXT : 'how to sign in to Steepshot',
        LINK : "https://www.youtube.com/embed/XAVapBwbS1U?autoplay=1"
    },

    BROWSE_ROUTES : [
        {
            NAME : 'hot',
            INDEX : 0
        },
        {
            NAME : 'new',
            INDEX : 1
        },
        {
            NAME : 'top',
            INDEX : 2
        }
    ],

    COMMENT_ERROR_MESSAGE : 'You can only create comments once per 20 seconds',
    COMMENT_SUCCESS_MESSAGE : 'Comment has been successfully added',

    SETTINGS_CHANGED_MESSAGE : 'Setting has been successfully changed',
    SETTINGS_NOTCHANGED_MESSAGE : 'Setting hasn\'t been changed',

    VOTE_ACTION_WHEN_NOT_AUTH : 'This action is only available to logged-in users',
    VOTE_ACTION_WHEN_NOT_AUTH_DEBOUNCE : 500,

    POST_DESRIPTION_MAXLENGTH : 120,
    POST_LIKED_BY : 'This post has been rated by these users'
}
