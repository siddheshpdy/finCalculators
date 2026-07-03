export const CALCULATOR_PATHS = {
  SIP: '/sip',
  Lumpsum: '/lumpsum',
  RD: '/rd',
  Loan: '/loan',
  SWP: '/swp',
  Goal: '/goal',
  Tracker: '/tracker',
  Help: '/help',
};

const PATH_TO_MENU = Object.entries(CALCULATOR_PATHS).reduce((accumulator, [menu, path]) => {
  accumulator[path] = menu;
  return accumulator;
}, {});

const normalizePathname = (pathname = '/') => {
  if (!pathname) {
    return '/';
  }

  const normalized = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  return normalized.toLowerCase();
};

export const getCanonicalPathForMenu = (menu) => CALCULATOR_PATHS[menu] || CALCULATOR_PATHS.SIP;

export const getMenuFromPathname = (pathname) => {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === '/') {
    return 'SIP';
  }

  return PATH_TO_MENU[normalizedPath] || 'SIP';
};

export const getLocationMenuState = (locationObject = window.location) => {
  const searchParams = new URLSearchParams(locationObject.search);
  const redirectedPath = searchParams.get('p');
  const requestedPath = redirectedPath
    ? new URL(redirectedPath, locationObject.origin).pathname
    : locationObject.pathname;
  const normalizedPath = normalizePathname(requestedPath);
  const isRedirected = Boolean(redirectedPath);
  const isKnownPath = normalizedPath === '/' || Boolean(PATH_TO_MENU[normalizedPath]);

  return {
    menu: getMenuFromPathname(normalizedPath),
    normalizedPath,
    isRedirected,
    isKnownPath,
  };
};
