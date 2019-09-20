import createHiveProfilePopup from '../HiveProfilePopup';
import { displayScore } from '../newDesign/utils';

const PROFILE_SCORE_EXTENSION_CLASS_NAME = 'HiveExtension-Twitter_profile-score';
const PROFILE_SIDEBAR_SELECTOR = '.ProfileSidebar';
const PROFILE_NAV_SELECTOR = '.ProfileNav';
const PROCESSED_INDICATOR_CLASS = 'HiveExtension-Twitter_profile-score-processed';

const BEE_ICON = `
    <svg style='height: 17px' viewBox="0 0 36 36">
        <use xlink:href="#hive-icon" />
    </svg>
`;

export class TwitterProfileScoreExtension {
    api;
    settings;

    constructor(api, settings) {
        this.api = api;
        this.settings = settings;
    }

    getUserId() {
        const profileNav = document.querySelector(PROFILE_NAV_SELECTOR);

        if (profileNav) {
            return profileNav.getAttribute('data-user-id');
        }
    }

    async start() {
        // This runs on a twitter users profile and injects
        // our score within the a nav bar
        // eg: Tweets | Following | Followers | Crypto Rank
        if (!this.isOnProfileScreen() || this.hasAlreadyRun()) {
            return;
        }

        const profileNav = document.querySelector('.ProfileNav-list');

        if (!profileNav || profileNav.classList.contains(PROCESSED_INDICATOR_CLASS)) {
            return;
        }

        profileNav.classList.add(PROCESSED_INDICATOR_CLASS);

        const userTwitterId = this.getUserId();
        if (!this.api.isIdentifierIndexed(userTwitterId)) return;

        const userData = await this.api.getFilteredTwitterUserData(userTwitterId);
        if (!userData) return;

        const { screenName, score, clusterName, rank } = userData;

        let tooltip = '';
        let label = '';
        let value = '';
        let icon = '';

        if (rank && this.settings.shouldDisplayRank) {
            value = rank;
            label = `${clusterName} Rank`;
            tooltip = `${clusterName} Rank ${rank}`;
        } else if (this.settings.shouldDisplayScore) {
            label = `${clusterName} Score`;
            value = displayScore(score);
            tooltip = `${clusterName} Score ${value}`;
        } else if (this.settings.shouldDisplayIcon) {
            label = `${clusterName}`;
            icon = BEE_ICON;
        }

        const displayElement = document.createElement('li');
        displayElement.classList.add('ProfileNav-item');
        displayElement.classList.add(PROFILE_SCORE_EXTENSION_CLASS_NAME);

        displayElement.innerHTML = `
        <li class="ProfileNav-stat ProfileNav-stat--link u-borderUserColor u-textCenter js-tooltip js-nav u-textUserColor" href="#" data-original-title="${tooltip}">
                <span class="ProfileNav-label">${label}</span>
                <span class="ProfileNav-value">${icon}</span>
                <span class="ProfileNav-value" data-count="${value}" data-is-compact="false">${value}</span>
        </li>
        `;

        const POPUP_ID = `HiveExtension_Twitter_Popup_Profile_${screenName}`;
        await createHiveProfilePopup(this.settings, userData, displayElement, displayElement, POPUP_ID, {});

        document.querySelector('.ProfileNav-item:nth-of-type(4)').insertAdjacentElement('afterend', displayElement);
    }

    isOnProfileScreen() {
        return Boolean(document.querySelector(PROFILE_SIDEBAR_SELECTOR));
    }

    hasAlreadyRun() {
        return Boolean(document.querySelector(`.${PROFILE_SCORE_EXTENSION_CLASS_NAME}`));
    }
}
