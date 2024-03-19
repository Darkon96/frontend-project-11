import uniqueId from 'lodash/uniqueId.js';
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import resources from './locales/index.js';
import watch from './view.js';
import parse from './parse.js';

const proxifyUrl = (rssUrl) => {
  const url = new URL('/get', 'https://allorigins.hexlet.app/');
  url.searchParams.set('disableCache', true);
  url.searchParams.set('url', rssUrl);
  return url;
};

const validate = (feeds, feedUrl) => {
  yup.setLocale({
    string: {
      url: () => ('feedback.error.notValidURL'),
    },
    mixed: {
      required: () => ('feedback.error.urlRequired'),
      notOneOf: () => ('feedback.error.alreadyExists'),
    },
  });

  const schema = yup.string().url().required().notOneOf(feeds.map((f) => f.url));
  return schema.validate(feedUrl);
};

const updateFeeds = (state) => {
  const feeds = state.feeds.map((feed) => {
    const url = proxifyUrl(feed.url);
    return axios.get(url)
      .then((response) => {
        const { contents } = response.data;
        const parsedData = parse(contents);
        const newPosts = parsedData.items
          .filter((item) => !state.posts.find((post) => post.title === item.title))
          .map((item) => ({ ...item, feedId: feed.feedId, postId: uniqueId() }));
        state.posts.unshift(...newPosts);
      })
      .catch((error) => { throw error; });
  });
  Promise.all(feeds).finally(() => setTimeout(() => updateFeeds(state), 5000));
};

const app = (initialState, elements, i18n) => {
  const watchedState = watch(initialState, elements, i18n);
  watchedState.lng = i18n.lng;
  setTimeout(() => updateFeeds(watchedState), 5000);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.urlInput.value;
    watchedState.downloadingProcess.status = 'downloading';
    validate(watchedState.feeds, url)
      .then(() => {
        return axios.get(proxifyUrl(url));
      })
      .then((response) => {
        const { contents } = response.data;
        const parsedData = parse(contents);
        const feed = {
          feedId: uniqueId(),
          url,
          title: parsedData.title,
          description: parsedData.description,
        };
        const posts = parsedData.items.map((item) => ({
          feedId: feed.feedId,
          postId: uniqueId(),
          ...item,
        }));
        watchedState.feeds.unshift(feed);
        watchedState.posts.unshift(...posts);
        watchedState.downloadingProcess.status = 'success';
      })
      .catch((error) => {
        if (error.isAxiosError) {
          watchedState.downloadingProcess.error = { key: 'feedback.error.netError' };
        }
        if (error.isParseError) {
          watchedState.downloadingProcess.error = { key: 'feedback.error.parseError' };
        }
        if (error.name === 'ValidationError') {
          watchedState.downloadingProcess.error = { key: error.message};
        }
        watchedState.downloadingProcess.status = 'failed';
        console.dir(error);
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (!id) {
      return;
    }
    watchedState.ui.modalPostId = id;
    watchedState.ui.seenPosts.push(id);
  });
};

export default () => {
  const defaultElements = {
    form: document.querySelector('.rss-form'),
    urlInput: document.getElementById('url-input'),
    submitButton: document.querySelector('[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
  };

  const defaultState = {
    lng: 'ru',
    feeds: [],
    posts: [],
    ui: {
      modalPostId: null,
      seenPosts: [],
    },
    downloadingProcess: {
      status: 'success',
      error: null,
    },
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: defaultState.lng,
      resources,
    })
    .then(() => app(defaultState, defaultElements, i18nInstance));
};