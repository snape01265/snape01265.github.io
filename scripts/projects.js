// --------------------------------
// Projects Data and Logic
// --------------------------------

const projectData = {
    "climb" : 
    {
        title : "CLIMB",
        date : "2026.04~",
        tags : ["C++", "Unreal Engine"],
        description : `
        <p>C.L.I.M.B is an incremental 3D climbing game I am currently developing. My goal for this project is to learn how to create games using UE5 and C++.</p>
        <figure class="desc-figure">
            <img src="assets/projects/climb/01.jpg" alt="CLIMB Gameplay">
            <figcaption>Prototype</figcaption>
        </figure>
        <p>Although the main objective of this project is to learn a new language and engine, I am enjoying having full authorship of the entire codebase and participating in game design of core gameplay mechanics.</p>
        `,
    },
    "my-little-puppy" : {
        title : "My Little Puppy",
        date : "2023.05~2026.03",
        tags : ["C#", "Unity"],
        description : `
        <p>My Little Puppy is </p>
        `,
    },
    "space-haste" : 
    {
        title : "Space Haste",
        date : "2023.03~2023.03",
        tags : ["C#", "Unity"],
        description : `
        fast as f boi
        `,
    },
    "soul-after" : 
    {
        title : "Soul After",
        date : "2021.08~2022.08",
        tags : ["C#", "Unity"],
        description : `
        <p>This project was </p>
        `,
    },
}

function switchProject(projectId)
{
    const display = document.getElementById('project-display');
    const divider = document.getElementById('project-divider');
    const data = projectData[projectId];

    if( data === undefined )
        return;

    let tagsHtml = '';
    
    if( data.tags && data.tags.length > 0 )
    {
        for( let i = 0; i < data.tags.length; i++ )
        {
            tagsHtml += `<span class="tag">${data.tags[i]}</span>`;
        }
    }

    display.innerHTML = `
        <h2 class="project-title">${data.title}</h2>
        <div class="project-tags">
            <span class="tag">Date: ${data.date}</span>
            ${tagsHtml}
        </div>
        <p class="project-desc">${data.description}</p>
    `;

    divider.classList.remove('hidden');
    display.classList.remove('active-project');
    
    setTimeout(function() 
    {
        display.classList.add('active-project');
    }, 10);
}

window.switchProject = switchProject;
window.projectData = projectData;