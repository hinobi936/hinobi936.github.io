document.addEventListener('DOMContentLoaded', () => {
    const materialWidth = document.getElementById('material-width');
    const lambda = document.getElementById('lambda');
    const cp = document.getElementById('cp');
    const ro = document.getElementById('ro');
    const time = document.getElementById('time');
    const edgeLeft = document.getElementById('Edge-left');
    const edgeRight = document.getElementById('Edge-right');
    const quantity = document.getElementById('quantity');

    document.querySelectorAll('input');

    document.body.addEventListener('click', (e) => {
        element = e.target.tagName
        console.log(element.target);
        if (element === 'INPUT') {
            checkEmpty();
        };
    })

    function checkEmpty() { };


});
