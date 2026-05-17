// --------------------------------
// Page routing logic
// --------------------------------

const routes = {
    // Landing pages
    '/' : 'pages/home.html',
    '/projects' : 'pages/projects.html',
    // '/experience' : 'pages/experience.html',
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
    let hash = window.location.hash.replace('#', '');

    if( hash === '' )
    {
        hash = '/';
    }

    UpdateMainNavigation(hash);

    const routePath = routes[hash];
    const appRoot = document.getElementById('app-root');

    return LoadPage(appRoot, routePath);
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
            renderGallery();
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
    const navLinks = document.querySelectorAll('a.button');
    const targetHref = '#' + hash;

    for( let i = 0; i < navLinks.length; i++ )
    {
        const link = navLinks[i];
        link.classList.remove('active');

        if( link.getAttribute('href') === targetHref )
        {
            link.classList.add('active');
        }
    }
}

window.SwitchTab = SwitchTab;
window.addEventListener('hashchange', Router);
window.addEventListener('load', Router);