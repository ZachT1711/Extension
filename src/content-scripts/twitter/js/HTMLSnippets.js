import { CONFIG } from '../../../config';
import escapeHTML from 'escape-html';
import moment from 'moment';

const POPUP_CLASS = 'HiveExtension-Twitter_popup-profile';

// const CLUSTER_IMAGES = {
//     Crypto: 'https://hive.one/static/assets/icons/Crypto_100.png',
//     Bitcoin: 'https://hive.one/static/assets/icons/BTC_100.png',
//     Ethereum: 'https://hive.one/static/assets/icons/ETH_100.png',
//     Ripple: 'https://hive.one/static/assets/icons/XRP_100.png',
// };
{
    /* <img class="${POPUP_CLASS}_cluster-score_image" src='${CLUSTER_IMAGES[clusterName]}' /> */
}
const createScoreRow = (clusterName, displayScore, scoreAsPercentage) => `
<div class="${POPUP_CLASS}_cluster-score">
    <div class="${POPUP_CLASS}_cluster-score_left">
        
        ${clusterName}
    </div>
    <div class="${POPUP_CLASS}_cluster-score_right">
        <span class="${POPUP_CLASS}_cluster-score_right_bold">${displayScore}</span>
        <span class="${POPUP_CLASS}_cluster-score_right_small">/ 1000</span>
    </div>
    <div class="${POPUP_CLASS}_cluster-score_progress-bar">
        <div class="${POPUP_CLASS}_cluster-score_progress-bar_bg"></div>
        <div class="${POPUP_CLASS}_cluster-score_progress-bar_progress" style="width:${scoreAsPercentage}%"></div>
    </div>
</div>
`;

const createScoreSection = clusters =>
    clusters
        .map(item => {
            const roundedScore = Math.round(item.score);
            const percentage = Math.floor((roundedScore / CONFIG.MAX_SCORE) * 100);

            return createScoreRow(item.name, roundedScore, percentage);
        })
        .join('');

const createFollower = item => {
    let rankHTML = '';
    let scoreHTML = '';

    if (item.hasOwnProperty('score') && item.hasOwnProperty('score')) {
        rankHTML = `<span class="${POPUP_CLASS}_followers_follower_score">${item.rank ? item.rank : ''}</span>`;
        scoreHTML = `<span class="${POPUP_CLASS}_followers_follower_rank">${item.score.toFixed(0)}</span>`;
    }

    return `
    <a href="https://twitter.com/${item.screenName}" class="${POPUP_CLASS}_followers_follower">
        ${rankHTML}
        <div class="${POPUP_CLASS}_followers_follower_user">
            <img class="${POPUP_CLASS}_followers_follower_user_avatar" src='${item.imageUrl}' />
            <div class="${POPUP_CLASS}_followers_follower_user_info">
                <span class="${POPUP_CLASS}_followers_follower_user_info_name">${item.name}</span>
                <span class="${POPUP_CLASS}_followers_follower_user_info_screen_name">@${item.screenName}</span>
            </div>
        </div>
        ${scoreHTML}
    </a>
    `;
};

// <img class="${POPUP_CLASS}_followers_follower_image" src="${imageUrl}" />
// <div class="${POPUP_CLASS}_followers_follower_name">@${screenName}</div>

const createFollowersSection = followers => `
    <div class="${POPUP_CLASS}_followers">
        ${followers.map(createFollower).join('')}
    </div>
`;

const createPodcastsSection = podcasts => {
    const createPodcast = ({ node }) => {
        const { name, episodeUrl, published, episodeName, hosts } = node;
        const safePodcastName = escapeHTML(name);
        const safeEpisodeName = escapeHTML(episodeName);
        const hostsList = hosts.edges.map(item => item.node.name).join(', ');

        const truncateText = input => (input.length > 50 ? `${input.substring(0, 50)}...` : input);

        let date = moment.unix(published);

        return `
            <a class="${POPUP_CLASS}_podcasts_podcast" rel="noopener noreferrer" href="${episodeUrl}" target='__blank'>
                <div class="${POPUP_CLASS}_podcasts_podcast_info">
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_podcast_name">${safePodcastName}</span>
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_episode_name">${truncateText(
            safeEpisodeName,
        )}</span>
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_host_list">${hostsList}<span>
                </div>
                <div class="${POPUP_CLASS}_podcasts_podcast_info_date">
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_date_day">${date.format('D')}</span>
                    <span class="${POPUP_CLASS}_podcasts_podcast_info_date_month_year">${date.format('MMM YY')}</span>
                </div>
            </a>
        `;
    };
    return `
        <div class="${POPUP_CLASS}_podcasts">
            ${podcasts.map(createPodcast).join('')}
        </div>
    `;
};

export const createPopupHTML = (screenName, userName, imageURL, scores, followers, podcasts) => {
    let SCORES_HTML = createScoreSection(scores);
    let FOLLOWERS_HTML = '';
    let PODCASTS_HTML = '';
    let PODCASTS_TAB_HTML = '';
    // let PODCASTS_TAB_HTML = `<div id="podcasts_tab_btn" class="${POPUP_CLASS}_tab">
    //     <span>Podcasts</span>
    // </div>`;

    if (followers) {
        console.log(followers);
        FOLLOWERS_HTML = createFollowersSection(followers);
    }

    if (podcasts && podcasts.length) {
        // PODCASTS_HTML = createPodcastsSection(podcasts);
    }

    return `
        <div>
            <div class="${POPUP_CLASS}_user_info_avatar">
                <img src='${imageURL}' />
            </div>
            <a href="https://twitter.com/${screenName}" class="${POPUP_CLASS}_user_info">
                <span class="${POPUP_CLASS}_user_info_name">${userName}</span>
                <span class="${POPUP_CLASS}_user_info_screen_name">@${screenName}</span>
            </a>
        </div>
        <br/>
        <div class="${POPUP_CLASS}_tabs">
            <div id="scores_tab_btn" class="${POPUP_CLASS}_tab">
                <span>Scores</span>
            </div>
            <div id="followers_tab_btn" class="${POPUP_CLASS}_tab">
                <span>Top Followers</span>
            </div>
            ${PODCASTS_TAB_HTML}
        </div>
        <br/>
        <div id='popup_scores' class="${POPUP_CLASS}_content">
            ${SCORES_HTML}
            <br/>
        </div>
        <div id='popup_followers'>
            ${FOLLOWERS_HTML}
            <br/>
        </div>
        <div id='popup_podcasts'>   
            ${PODCASTS_HTML}
        </div>
        <br/>
        <div class="${POPUP_CLASS}_credit">
            <svg viewBox="0 0 36 36" class="${POPUP_CLASS}_credit_icon">
                <use xlink:href="#HiveExtension-icon-bee" />
            </svg>
            <a href="https://hive.one/p/${screenName}?ref=hive-extension" target='__blank'>
                Learn more about this profile at hive.one
            </a>
        </div>
    `;
};

export const createHoverInjectedHTML = (screenName, scores, followers, podcasts, ownProfile = false) => {
    let SCORES_HTML = createScoreSection(scores);
    let FOLLOWERS_HTML = '';
    let PODCASTS_HTML = '';
    let PODCASTS_TAB_HTML = '';

    if (followers) {
        FOLLOWERS_HTML = createFollowersSection(followers);
    }

    if (podcasts && podcasts.length) {
        PODCASTS_HTML = createPodcastsSection(podcasts);
        PODCASTS_TAB_HTML = `<div id="podcasts_tab_btn" class="${POPUP_CLASS}_tab">
            <span>Podcasts</span>
        </div>`;
    }

    return `
        <br />
        <div class="${POPUP_CLASS}_tabs">
            <div id="scores_tab_btn" class="${POPUP_CLASS}_tab">
                <span>Scores</span>
            </div>
            <div id="followers_tab_btn" class="${POPUP_CLASS}_tab">
                <span>Top Followers</span>
            </div>
            ${PODCASTS_TAB_HTML}
        </div>
        <br/>
        <div id='popup_scores' class="${POPUP_CLASS}_content">
            ${SCORES_HTML}
            <br/>
        </div>
        <div id='popup_followers'>
            ${FOLLOWERS_HTML}
            <br/>
        </div>
        <div id='popup_podcasts'>   
            ${PODCASTS_HTML}
        </div>
        <br/>
        <div class="${POPUP_CLASS}_credit">
            <svg viewBox="0 0 36 36" class="${POPUP_CLASS}_credit_icon">
                <use xlink:href="#HiveExtension-icon-bee" />
            </svg>
            <a href="https://hive.one/p/${screenName}?ref=hive-extension" target='__blank'>
                Learn more about ${ownProfile ? 'your' : 'this'} profile at hive.one
            </a>
        </div>
    `;
};
