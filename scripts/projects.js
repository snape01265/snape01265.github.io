// --------------------------------
// Projects Data and Logic
// --------------------------------

const projectData = {
    "climb" :
        {
            info :
                {
                    "Date" : "2026.04 -",
                    "Engine" : "Unreal Engine",
                    "Team Size" : "2",
                }
        },
    "my-little-puppy" :
        {
            info :
                {
                    "Date" : "2023.05 - 2026.03",
                    "Engine" : "Unity",
                    "Team Size" : "30+",
                },
            linksContent : `
                <div class="icon-link-container">
                    <a href="https://store.steampowered.com/app/2102040/My_Little_Puppy/" target="_blank" rel="noopener noreferrer" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-steam"></use>
                        </svg>
                    </a>
                    <a href="https://www.youtube.com/watch?v=IHHLVARFvNQ" target="_blank" rel="noopener noreferrer" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-youtube"></use>
                        </svg>
                    </a>
                </div>
                <a href="javascript:void(0);" class="button" onclick="OpenCodeModal('assets/projects/my-little-puppy/BaristaGraph.cs')">Code Sample 1</a>
                <a href="javascript:void(0);" class="button" onclick="OpenCodeModal('assets/projects/my-little-puppy/BaristaGraphView.cs')">Code Sample 2</a>
                <a href="javascript:void(0);" class="button" onclick="OpenCodeModal('assets/projects/my-little-puppy/MovePathEditor2.cs')">Code Sample 3</a>
                <a href="javascript:void(0);" class="button" onclick="OpenCodeModal('assets/projects/my-little-puppy/OmniKey.cs')">Code Sample 4</a>            `
        },
    "space-haste" :
        {
            info :
                {
                    "Date" : "2023.03 - 2023.03",
                    "Engine" : "Unity",
                    "Team Size" : "4",
                },
            linksContent : `
                <div class="icon-link-container">
                    <a href="https://www.youtube.com/watch?v=hVrAXYSy0VY" target="_blank" rel="noopener noreferrer" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-youtube"></use>
                        </svg>
                    </a>
                    <a href="https://github.com/snape01265/Space-haste.git" target="_blank" rel="noopener noreferrer" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-github"></use>
                        </svg>
                    </a>
                </div>
            `
        },
    "soul-after" :
        {
            info :
                {
                    "Date" : "2021.08 - 2022.08",
                    "Engine" : "Unity",
                    "Team Size" : "6",
                },
            linksContent : `
                <div class="icon-link-container">
                    <a href="https://store.steampowered.com/app/2148220/Soul_After/" target="_blank" rel="noopener noreferrer" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-steam"></use>
                        </svg>
                    </a>
                    <a href="https://github.com/snape01265/Soul-after.git" target="_blank" rel="noopener noreferrer" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-github"></use>
                        </svg>
                    </a>
                </div>
            `
        },
};

async function SwitchProject(projectId)
{
    const display = document.getElementById('project-display');
    const divider = document.getElementById('project-divider');
    const data = projectData[projectId];

    if( data === undefined )
        return;

    let htmlInfo = GetInfoData(projectId, data);
    let htmlDescription = await GetProjectData(projectId);
    let htmlLinks = GetLinksData(projectId, data);

    display.innerHTML = `
        <h2 class="project-title" data-l10n="projects_list.${projectId}_title"></h2>
        <div class="project-header-container">
            <div class="project-about-block">
                <h3 data-l10n="project_details.about"></h3>
                <div data-l10n="projects_list.${projectId}_about"></div>
            </div>
            <div class="project-right-column">
                <div class="project-info-block">
                    ${htmlInfo}
                </div>
                ${htmlLinks}
            </div>
        </div>
        <div class="project-desc">${htmlDescription}</div>
    `;

    TranslatePage();
    divider.classList.remove('hidden');
    display.classList.remove('active-project');

    setTimeout(function() {
        display.classList.add('active-project');
    }, 10);

    const thumbnails = document.querySelectorAll('.project-thumb');
    for( let i = 0; i < thumbnails.length; i++ )
    {
        thumbnails[i].classList.remove('active-project');
    }

    const activeThumbnail = document.querySelector(`.project-thumb[onclick="SwitchProject('${projectId}')"]`);
    if( activeThumbnail )
    {
        activeThumbnail.classList.add('active-project');
    }

    const newHash = '#/projects?project=' + projectId;
    if( window.location.hash !== newHash )
    {
        history.pushState(null, '', newHash);
    }
}

function GetInfoData(projectId, data)
{
    let htmlInfo = "";

    if( data.info )
    {
        for( const key in data.info )
        {
            const safeKey = key.toLowerCase().replace(' ', '_');

            htmlInfo += `
                <div class="info-row">
                    <span class="info-key" data-l10n="project_details.${safeKey}"></span>
                    <span class="info-value" data-l10n="projects_list.${projectId}_info_${safeKey}"></span>
                </div>
            `;
        }
    }

    return htmlInfo;
}

async function GetProjectData(projectId)
{
    let htmlDescription = "";
    try
    {
        const response = await fetch(`pages/projects/${projectId}.html`);

        if( response.ok )
        {
            htmlDescription = await response.text();
        }
        else
        {
            htmlDescription = `<p>Project description not available.</p>`;
        }
    }
    catch( error )
    {
        console.error("Failed to load project description:", error);
        htmlDescription = `<p>Error loading project description.</p>`;
    }

    return htmlDescription;
}

function GetLinksData(projectId, data)
{
    let htmlLinks = "";

    if( data.linksContent )
    {
        htmlLinks = `
            <div class="project-extra-block">
                <h3 data-l10n="projects_list.${projectId}_links_title"></h3>
                ${data.linksContent}
            </div>
        `;
    }

    return htmlLinks;
}

async function OpenCodeModal(filePath)
{
    const modal = document.getElementById('code-modal');
    const modalBody = document.getElementById('code-modal-body');

    modalBody.textContent = "Loading...";
    modal.classList.add('active');

    try
    {
        const response = await fetch(filePath);

        if( response.ok )
        {
            const codeText = await response.text();
            modalBody.textContent = codeText;
        }
        else
        {
            modalBody.textContent = "Failed to load code file.";
        }
    }
    catch( error )
    {
        console.error("Failed to load code file:", error);
        modalBody.textContent = "Something went wrong while fetching the code.";
    }
}

function CloseCodeModal()
{
    document.getElementById('code-modal').classList.remove('active');
}

window.SwitchProject = SwitchProject;
window.OpenCodeModal = OpenCodeModal;
window.CloseCodeModal = CloseCodeModal;
window.projectData = projectData;