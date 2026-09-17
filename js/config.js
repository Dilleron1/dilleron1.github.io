/**
 * Единственный файл, который нужно править под себя.
 * Всё остальное — движок страницы.
 */
window.PROFILE = {
  name: "nikich",
  handle: "@nikich",
  displayName: "Nikich Nikichovskiy",
  avatar: "assets/avatar.png",

  /** Показывать синюю галочку рядом с ником */
  verified: true,
  /** Статус-значок на аватаре: online | idle | dnd | offline */
  status: "dnd",

  /** Фразы, которые печатаются по кругу под ником */
  taglines: [
    "Люблю VSCode   ",
    "Возможно я не самый лучший друг/сын...  ",
    "Капельку грусти и максимум музыки..",
    "Люблю фурри:3",
    "Меня не надо судить..",
    "My best friends:     ",
    "bighikc",
    "KerrShady",
    "Erik"
  ],

  /** Биография, можно писать <br> для переноса */
  bio: "Привет, я Алексей. Мой псевдоним Никич/Диллерон/нкч. <br>Мне 18 лет, я более углубляюсь в Discord API. Делаю ботов/self-ботов, планирую изучить C#, C++, C. <br>Любимый фильм/сериал 'MrRobot'.",

  /** Короткие факты-плашки под био. [{ label, value }] */
  facts: [
    { label: "стаж", value: "3+ года/лет" },
    { label: "стек", value: "Python" },
    { label: "стек", value: "JS" },
    { label: "стек", value: "Lua" }
  ],

  /**
   * Ссылки-кнопки. icon — ключ из js/icons.js
   * copy — если задано, по клику копируется в буфер вместо перехода
   */
  links: [
    { label: "Discord", sub: "нажми чтобы скопировать", copy: "nikich6842", icon: "discord", accent: true },
    { label: "GitHub", sub: "код и проекты", url: "https://github.com/Dilleron1", icon: "github" },
    { label: "Steam", sub: "мой профиль", url: "https://steamcommunity.com/id/elmatadordeabuelas3000xdxd/", icon: "steam" }
  ],

  /** Иконки без подписей. icon — ключ из js/icons.js */
  socials: [
    { icon: "discord", url: "https://discord.com/users/539888363587764234", label: "Discord" },
    { icon: "github", url: "https://github.com/Dilleron1", label: "GitHub" },
    { icon: "youtube", url: "https://www.youtube.com/@LichniiMafioznik", label: "YouTube" },
    { icon: "twitch", url: "https://www.twitch.tv/lichniimafioznik", label: "Twitch" },
    { icon: "spotify", url: "https://open.spotify.com/user/31ahncex5nsqmhgvkg3yzvnwuanq", label: "Spotify" }
  ],

  /** Блок статистики под карточкой */
  stats: [
    { id: "views", label: "просмотры", value: null, icon: "eye" },
    { id: "uptime", label: "на сайте", value: "—", icon: "clock" },
    { id: "utc", label: "время", value: "—", icon: "signal" }
  ],

  /** Плеер. Положи трек и обложку в assets/ и укажи пути */
  music: {
    enabled: true,
    title: "SMARTPILL",
    artist: "LAFLAME SO LOUD, HoneyyHustle",
    src: "assets/track.mp3"
  },

  /** Экран входа (как на guns.lol) — нужен, чтобы браузер разрешил звук */
  enterScreen: true,

  /** Тёмный фон: интенсивность частиц */
  background: {
    particles: 70,
    speed: 0.35,
    linkDistance: 130
  }
};
