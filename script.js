const routes = {
    // Landing pages
    '/' : 'pages/home.html',
    '/projects' : 'pages/projects.html',
    '/experience' : 'pages/experience.html',
    '/gallery' : 'pages/gallery.html',
    '/profile' : 'pages/profile.html',

    // Individual project pages
    '/projects/my-little-puppy' : 'pages/projects/my-little-puppy.html',
    '/projects/soul-after' : 'pages/projects/soul-after.html',
    '/projects/space-haste' : 'pages/projects/space-haste.html',
};

async function Router()
{
    let hash = window.location.hash.replace('#', '');

    if( hash === '' )
    {
        hash = '/';
    }

    const routePath = routes[hash];
    const appRoot = document.getElementById('app-root');

    return LoadPage(appRoot, routePath);
}

async function LoadPage(appRoot, routePath)
{
    // If route is invalid, redirect to home
    if( routePath === undefined )
    {
        window.location.hash = '#/';
        return;
    }

    // If app root is not found, log an error and redirect to home
    if( appRoot === null )
    {
        console.error("App root element not found");
        window.location.hash = '#/';
        return;
    }

    try
    {
        const response = await fetch(routePath);
        const html = await response.text();

        appRoot.innerHTML = html;
    }
    catch( error )
    {
        console.error("Failed to load the page:", error);
        appRoot.innerHTML = "<h2>Error loading page.</h2>";
    }
}

window.addEventListener('hashchange', Router);
window.addEventListener('load', Router);