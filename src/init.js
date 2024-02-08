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
        watchedState.form.valid = true;
        watchedState.form.processFeedback = null;
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
        watchedState.form.processFeedback = { key: 'feedback.success.feedAdded', type: 'success' };
        watchedState.downloadingProcess.status = 'idle';
      })
      .catch((error) => {
        if (error.isAxiosError) {
          watchedState.form.processFeedback = { key: 'feedback.error.netError', type: 'error' };
        }
        if (error.isParseError) {
          watchedState.form.processFeedback = { key: 'feedback.error.parseError', type: 'error' };
        }
        if (error.name === 'ValidationError') {
          watchedState.form.valid = false;
          watchedState.form.processFeedback = { key: error.message, type: 'error' };
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
    watchedState.ui.readPosts.push(id);
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
    feeds: [],
    posts: [],
    ui: {
      modalPostId: null,
      readPosts: [],
    },
    downloadingProcess: {
      status: 'idle', // idle, downloading, failed
    },
    form: {
      lng: '',
      valid: true, // true, false
      processFeedback: null,
    },
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      resources,
    })
    .then(() => app(defaultState, defaultElements, i18nInstance));
};