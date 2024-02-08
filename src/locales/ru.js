export default {
  translation: {
    text: {
      header: 'RSS агрегатор',
      slogan: 'Начните читать RSS сегодня! Это легко, это красиво.',
      example: 'Пример: 1. http://lorem-rss.herokuapp.com/feed 2. https://ru.hexlet.io/lessons.rss',
      label: 'Ссылка RSS',
      posts: 'Посты',
      feeds: 'Фиды',
      submitButton: 'Добавить',
      readButton: 'Просмотр',
    },
    feedback: {
      error: {
        urlRequired: 'Не должно быть пустым',
        notValidURL: 'Ссылка должна быть валидным URL',
        alreadyExists: 'RSS уже существует',
        netError: 'Ошибка сети',
        parseError: 'Ресурс не содержит валидный RSS',
      },
      success: {
        feedAdded: 'RSS успешно загружен',
      },
    },
  },
};
