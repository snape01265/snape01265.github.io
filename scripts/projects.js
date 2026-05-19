// --------------------------------
// Projects Data and Logic
// --------------------------------

const projectData = {
    "climb" :
        {
            title : "CLIMB",
            about : `<p>An incremental 3D climbing game.</p>`,
            info :
                {
                    "Date" : "2026.04 -",
                    "Engine" : "Unreal Engine",
                    "Team Size" : "2",
                }
        },
    "my-little-puppy" :
        {
            title : "My Little Puppy",
            about : `<p>A heartwarming adventure game about a dog\'s journey through the afterlife to reunite with his owner.</p>
            <p>Developed at Dreamotion Inc. in a team scaling up to 30 members, this project marked my entry into the professional game industry.</p>`,
            info :
                {
                    "Date" : "2023.05 - 2026.03",
                    "Engine" : "Unity",
                    "Team Size" : "30+",
                },
            linksTitle : "Links & Code",
            linksContent : `
                <div class="icon-link-container">
                    <a href="https://store.steampowered.com/app/2102040/My_Little_Puppy/" target="_blank" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-steam"></use>
                        </svg>
                    </a>
                    <a href="https://www.youtube.com/watch?v=IHHLVARFvNQ" target="_blank" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-youtube"></use>
                        </svg>
                    </a>
                </div>
                <a href="javascript:void(0);" class="button" onclick="OpenCodeModal('assets/projects/my-little-puppy/BaristaGraph.cs')">Code Sample 1</a>
                <a href="javascript:void(0);" class="button" onclick="OpenCodeModal('assets/projects/my-little-puppy/MovePathEditor2.cs')">Code Sample 2</a>
                <a href="javascript:void(0);" class="button" onclick="OpenCodeModal('assets/projects/my-little-puppy/SailMode.cs')">Code Sample 3</a>
                <a href="javascript:void(0);" class="button" onclick="OpenCodeModal('assets/projects/my-little-puppy/OmniKey.cs')">Code Sample 4</a>
            `
        },
    "space-haste" :
        {
            title : "Space Haste",
            about : `<p>A 3D space racing game where players pilot spaceships through the cosmos.</p>
            <p>Created as a Capstone Project for the KRAFTON Jungle bootcamp. I have taken the role of a team leader in this project.</p>`,
            info :
                {
                    "Date" : "2023.03 - 2023.03",
                    "Engine" : "Unity",
                    "Team Size" : "4",
                },
            linksTitle : "Links",
            linksContent : `
                <div class="icon-link-container">
                    <a href="https://www.youtube.com/watch?v=hVrAXYSy0VY" target="_blank" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-youtube"></use>
                        </svg>
                    </a>
                    <a href="https://github.com/snape01265/Space-haste.git" target="_blank" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-github"></use>
                        </svg>
                    </a>
                </div>
            `
        },
    "soul-after" :
        {
            title : "Soul After",
            about : `<p>A story-driven top-down adventure game that explores the relationship between life and death.</p>
            <p>Developed as a passion project by a team of 6 students, marking our debut in game development.</p>`,
            info :
                {
                    "Date" : "2021.08 - 2022.08",
                    "Engine" : "Unity",
                    "Team Size" : "6",
                },
            linksTitle : "Links",
            linksContent : `
                <div class="icon-link-container">
                    <a href="https://store.steampowered.com/app/2148220/Soul_After/" target="_blank" class="icon-link">
                        <svg class="social-icon" fill="currentColor">
                            <use href="#icon-steam"></use>
                        </svg>
                    </a>
                    <a href="https://github.com/snape01265/Soul-after.git" target="_blank" class="icon-link">
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

    let htmlInfo = GetInfoData(data);
    let htmlDescription = await GetProjectData(projectId);
    let htmlLinks = GetLinksData(data);

    display.innerHTML = `
        <h2 class="project-title">${data.title}</h2>
        <div class="project-header-container">
            <div class="project-about-block">
                <h3>About</h3>
                ${data.about}
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
}

function GetInfoData(data)
{
    let htmlInfo = "";

    if( data.info )
    {
        for( const key in data.info )
        {
            const value = data.info[key];

            htmlInfo += `
                <div class="info-row">
                    <span class="info-key">${key}</span>
                    <span class="info-value">${value}</span>
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

function GetLinksData(data)
{
    let htmlLinks = "";

    if( data.linksTitle && data.linksContent )
    {
        htmlLinks = `
            <div class="project-extra-block">
                <h3>${data.linksTitle}</h3>
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