import onChange from 'on-change';

const renderText = (i18n) => {
  const textElemente = {
    header: document.querySelector('h1'),
    slogan: document.querySelector('p.lead'),
    example: document.querySelector('.mt-2'),
    label: document.querySelector('label'),
  };

  textElemente.header.textContent = i18n.t('text.header');
  textElemente.slogan.textContent = i18n.t('text.slogan');
  textElemente.example.textContent = i18n.t('text.example');
  textElemente.label.textContent = i18n.t('text.label');
};

const renderFeedback = (state, i18n, elements) => {
  const feedbackEl = document.querySelector('.feedback');
  const fromContainer = elements.form.parentElement;
  if (feedbackEl) { feedbackEl.remove(); }
  elements.urlInput.classList.remove('is-invalid');

  if (state.downloadingProcess.status) {
    const newFeedbackEl = document.createElement('p');
    newFeedbackEl.classList.add('feedback', 'm-0', 'position-absolute', 'small');
    if (state.downloadingProcess.status === 'failed') {
      elements.urlInput.classList.add('is-invalid');
      newFeedbackEl.classList.add('text-danger');
      newFeedbackEl.textContent = i18n.t(state.downloadingProcess.error.key);
    fromContainer.append(newFeedbackEl);
    }
    if (state.downloadingProcess.status === 'success') {
      newFeedbackEl.classList.add('text-success');
      newFeedbackEl.textContent = i18n.t('feedback.success.feedAdded');
    fromContainer.append(newFeedbackEl);
    }
    
  }
};

const renderFeeds = (state, i18n) => {
  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');
  state.feeds.forEach((feed) => {
    const feedEl = document.createElement('li');
    feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');

    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm0');
    feedTitle.textContent = feed.title;

    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;

    feedEl.append(feedTitle, feedDescription);
    feedsList.append(feedEl);
  });

  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');
  const feedCardBody = document.createElement('div');
  feedCardBody.classList.add('card-body');
  const feedBodyTitle = document.createElement('h2');
  feedBodyTitle.classList.add('card-title', 'h4');
  feedBodyTitle.textContent = i18n.t('text.feeds');

  feedCardBody.append(feedBodyTitle);
  feedsCard.append(feedCardBody, feedsList);

  const feedsContainer = document.querySelector('.feeds');
  const oldFeedsCard = feedsContainer.querySelector('.card');
  if (oldFeedsCard) { oldFeedsCard.remove(); }
  feedsContainer.append(feedsCard);
};

const renderPosts = (state, i18n) => {
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.forEach((post) => {
    const postEl = document.createElement('li');
    postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-item-start', 'border-0', 'border-end-0');

    const postTitle = document.createElement('a');
    const isRead = state.ui.seenPosts.includes(post.postId);
    const postTitleClasses = isRead ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    postTitle.classList.add(...postTitleClasses);
    postTitle.href = post.link;
    postTitle.setAttribute('data-id', post.postId);
    postTitle.setAttribute('target', '_blank');
    postTitle.rel = 'noopener noreferrer';
    postTitle.textContent = post.title;

    const readButton = document.createElement('button');
    readButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    readButton.type = 'button';
    readButton.setAttribute('data-id', post.postId);
    readButton.setAttribute('data-bs-toggle', 'modal');
    readButton.setAttribute('data-bs-target', '#modal');
    readButton.textContent = i18n.t('text.readButton');

    postEl.append(postTitle, readButton);
    postsList.append(postEl);
  });

  const postsCard = document.createElement('div');
  postsCard.classList.add('card', 'border-0');
  const postCardBody = document.createElement('div');
  postCardBody.classList.add('card-body');
  const postBodyTitle = document.createElement('h2');
  postBodyTitle.classList.add('card-title', 'h4');
  postBodyTitle.textContent = i18n.t('text.posts');

  postCardBody.append(postBodyTitle);
  postsCard.append(postCardBody, postsList);

  const postsContainer = document.querySelector('.posts');
  const oldPostsCard = postsContainer.querySelector('.card');
  if (oldPostsCard) { oldPostsCard.remove(); }
  postsContainer.append(postsCard);
};

const renderModal = (state) => {
  const modalEl = document.querySelector('.modal');
  const modalPost = state.posts.find((post) => post.postId === state.ui.modalPostId);
  modalEl.querySelector('.modal-title').textContent = modalPost.title;
  modalEl.querySelector('.modal-body').textContent = modalPost.description;
  modalEl.querySelector('.full-article').href = modalPost.link;
};

const renderDownloadingStatus = (state, elements, i18n, status) => {
  switch (status) {
    case 'success':
      elements.urlInput.classList.remove('disabled');
      elements.submitButton.classList.remove('disabled');
      elements.form.reset();
      elements.urlInput.focus();
      renderFeedback(state, i18n, elements);
      break;
    case 'downloading':
      elements.urlInput.classList.add('disabled');
      elements.submitButton.classList.add('disabled');
      break;
    case 'failed':
      elements.urlInput.classList.remove('disabled');
      elements.submitButton.classList.remove('disabled');
      elements.urlInput.focus();
      renderFeedback(state, i18n, elements);
      break;
    default:
      break;
  }
};

const render = (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'lng':
      renderText(i18n);
      break;
    case 'form.valid':
      if (value) {
        elements.submitButton.classList.remove('disabled');
      } else {
        elements.submitButton.classList.add('disabled');
      }
      break;
    case 'downloadingProcess.status':
      renderDownloadingStatus(state, elements, i18n, value);
      break;
    case 'downloadingProcess.processFeedback':
      renderFeedback(state, i18n, elements);
      break;
    case 'feeds':
      renderFeeds(state, i18n);
      break;
    case 'posts':
      renderPosts(state, i18n);
      break;
    case 'ui.seenPosts':
      renderPosts(state, i18n);
      break;
    case 'ui.modalPostId':
      renderModal(state);
      break;
    default:
      break;
  }
};

export default (state, elements, i18next) => onChange(state, render(state, elements, i18next));
