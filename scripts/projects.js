// --------------------------------
// Projects Data and Logic
// --------------------------------

const projectData = {
    "climb" : {
        title : "CLIMB",
        date : "2026.04~",
        tags : ["C++", "Unreal Engine"],
        description : `Working on a new project called CLIMB...`,
    },
    "my-little-puppy" : {
        title : "My Little Puppy",
        date : "2023.05~2026.03",
        tags : ["C#", "Unity"],
        description : `<p>This is the first paragraph of text. I can explain the initial concept of the game here, talking about the core mechanics and what inspired the project.</p>
        
        <figure class="desc-figure">
            <img src="assets/gallery/soul-after/01.jpg" alt="Soul After Gameplay">
            <figcaption>Early prototype showcasing the combat system.</figcaption>
        </figure>

        <p>This is the text that continues immediately after the image. You can add as many paragraphs or figures as you want down the page!</p>`,
    },
    "space-haste" : {
        title : "Space Haste",
        date : "2023.03~2023.03",
        tags : ["C#", "Unity"],
        description : `fast as f boi`,
    },
    "soul-after" : {
        title : "Soul After",
        date : "2021.08~2022.08",
        tags : ["C#", "Unity"],
        description : `first`
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