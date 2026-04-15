function showPage(pageId) 
{
    const pages = document.querySelectorAll('.page');
    
    pages.forEach(page => 
    {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    
    targetPage.classList.add('active');
}