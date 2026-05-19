// --------------------------------
// Page routing logic
// --------------------------------

const routes = {
    // Landing pages
    '/' : 'pages/home.html',
    '/projects' : 'pages/projects.html',
    '/experience/education' : 'pages/education.html',
    '/experience/work' : 'pages/work.html',
    '/gallery' : 'pages/gallery.html',
    '/profile' : 'pages/profile.html',

    // Individual project pages
    '/projects/climb' : 'pages/projects/climb.html',
    '/projects/my-little-puppy' : 'pages/projects/my-little-puppy.html',
    '/projects/space-haste' : 'pages/projects/space-haste.html',
    '/projects/soul-after' : 'pages/projects/soul-after.html',
};

async function Router()
{
    let fullHash = window.location.hash.replace('#', '');
    let hash = fullHash;
    let queryString = '';

    if( fullHash.indexOf('?') !== -1 )
    {
        const parts = fullHash.split('?');
        hash = parts[0];
        queryString = parts[1];
    }

    if( hash === '' )
    {
        hash = '/';
    }

    const routePath = routes[hash];
    const appRoot = document.getElementById('app-root');

    await LoadPage(appRoot, routePath);

    UpdateMainNavigation(hash);
    HandleQueryParams(queryString, hash);
}

async function LoadPage(appRoot, routePath)
{
    if( routePath === undefined )
    {
        window.location.hash = '#/';
        return;
    }

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

        if( routePath === 'pages/gallery.html' )
        {
            RenderGallery();
        }
    }
    catch( error )
    {
        console.error("Failed to load the page:", error);
        appRoot.innerHTML = "<h2>Error loading page.</h2>";
    }
}

function SwitchTab(tabName)
{
    const tabs = document.querySelectorAll('.tab-content');

    for( let i = 0; i < tabs.length; i++ )
    {
        tabs[i].classList.remove('active');
    }

    const activeTab = document.getElementById('tab-' + tabName);

    if( activeTab !== null )
    {
        activeTab.classList.add('active');
    }

    const bottomDivider = document.getElementById('dynamic-divider');
    if( bottomDivider !== null )
    {
        bottomDivider.classList.remove('hidden');
    }

    const tabButtons = document.querySelectorAll('.button-container .button');

    for( let i = 0; i < tabButtons.length; i++ )
    {
        const btn = tabButtons[i];

        btn.classList.remove('active');

        if( btn.getAttribute('href') === '#/experience/' + tabName )
        {
            btn.classList.add('active');
        }
    }
}

function UpdateMainNavigation(hash)
{
    const targetHref = '#' + hash;
    const mainNavLinks = document.querySelectorAll('#landing > header.button-container a.button');

    for( let i = 0; i < mainNavLinks.length; i++ )
    {
        const link = mainNavLinks[i];
        const linkHref = link.getAttribute('href');

        link.classList.remove('active');

        const pathParts = linkHref.split('/');
        const basePath = pathParts[0] + '/' + pathParts[1];

        if( targetHref.startsWith(basePath) )
        {
            link.classList.add('active');
        }
    }

    const subNavLinks = document.querySelectorAll('#app-root a.button');

    for( let i = 0; i < subNavLinks.length; i++ )
    {
        const link = subNavLinks[i];
        const linkHref = link.getAttribute('href');

        link.classList.remove('active');

        if( linkHref === targetHref )
        {
            link.classList.add('active');
        }
    }
}

function HandleQueryParams(queryString, hash)
{
    if( queryString === '' )
        return;

    const params = new URLSearchParams(queryString);

    if( hash === '/projects' )
    {
        const projectId = params.get('project');
        window.SwitchProject(projectId);
    }
}

window.SwitchTab = SwitchTab;
window.addEventListener('hashchange', Router);
window.addEventListener('load', Router);