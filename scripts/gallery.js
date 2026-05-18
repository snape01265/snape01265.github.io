// --------------------------------
// Gallery modal logic
// --------------------------------

const galleryData = [
    {
        projectTitle : "My Little Puppy",
        images : [
            "assets/gallery/my-little-puppy/01.jpg",
            "assets/gallery/my-little-puppy/02.jpg",
            "assets/gallery/my-little-puppy/03.jpg",
            "assets/gallery/my-little-puppy/04.jpg",
            "assets/gallery/my-little-puppy/05.jpg",
            "assets/gallery/my-little-puppy/06.jpg",
            "assets/gallery/my-little-puppy/07.jpg",
            "assets/gallery/my-little-puppy/08.jpg",
            "assets/gallery/my-little-puppy/09.jpg",
            "assets/gallery/my-little-puppy/10.jpg",
            "assets/gallery/my-little-puppy/11.jpg",
            "assets/gallery/my-little-puppy/12.jpg",
            "assets/gallery/my-little-puppy/13.jpg",
            "assets/gallery/my-little-puppy/14.jpg",
            "assets/gallery/my-little-puppy/15.jpg",
            "assets/gallery/my-little-puppy/16.jpg",
        ]
    },
    {
        projectTitle : "Soul After",
        images : [
            "assets/gallery/soul-after/01.jpg",
            "assets/gallery/soul-after/02.jpg",
            "assets/gallery/soul-after/03.jpg",
            "assets/gallery/soul-after/04.jpg",
            "assets/gallery/soul-after/05.jpg",
            "assets/gallery/soul-after/06.jpg",
            "assets/gallery/soul-after/07.jpg",
            "assets/gallery/soul-after/08.jpg",
            "assets/gallery/soul-after/09.jpg",
            "assets/gallery/soul-after/10.jpg",
            "assets/gallery/soul-after/11.jpg",
            "assets/gallery/soul-after/12.jpg",
            "assets/gallery/soul-after/13.jpg",
            "assets/gallery/soul-after/14.jpg",
            "assets/gallery/soul-after/15.jpg",
        ]
    },
];

let currentProjectIndex = -1;
let currentImageIndex = -1;

function RenderGallery()
{
    const container = document.getElementById('gallery-container');

    if( container === null )
        return;

    let html = '';

    for( let i = 0; i < galleryData.length; i++ )
    {
        const project = galleryData[i];

        html += `<div class="gallery-block">
                    <h3 class="gallery-title">${project.projectTitle}</h3>
                    <div class="gallery-grid">
                `;

        for( let j = 0; j < project.images.length; j++ )
        {
            const imagePath = project.images[j];
            html += `<img src="${imagePath}" class="gallery-thumbnail" onclick="openModal(${i}, ${j})">`;
        }
        html += `</div></div>`;
    }

    container.innerHTML = html;
}

function OpenModal(projectIndex, imageIndex)
{
    currentProjectIndex = projectIndex;
    currentImageIndex = imageIndex;

    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');

    modalImage.src = galleryData[projectIndex].images[imageIndex];
    modal.classList.add('active');
}

function CloseModal()
{
    document.getElementById('modal').classList.remove('active');
}

function ChangeImage(direction, event)
{
    if( event )
        event.stopPropagation();

    const project = galleryData[currentProjectIndex];

    currentImageIndex += direction;

    if( currentImageIndex < 0 )
    {
        currentImageIndex = project.images.length - 1;
    }
    else if( currentImageIndex >= project.images.length )
    {
        currentImageIndex = 0;
    }

    const modalImage = document.getElementById('modal-image');
    modalImage.src = project.images[currentImageIndex];
}