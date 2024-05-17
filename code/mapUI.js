
document.getElementById('toggle-buildings-legend').addEventListener('click', function () {
    var legend = document.getElementById('buildings-legend-content');
    if (legend.classList.contains('open')) {
        legend.classList.remove('open');
        legend.classList.add('closed');
    } else {
        legend.classList.remove('closed');
        legend.classList.add('open');
    }
});

document.getElementById('toggle-highways-legend').addEventListener('click', function () {
    var legend = document.getElementById('highways-legend-content');
    if (legend.classList.contains('open')) {
        legend.classList.remove('open');
        legend.classList.add('closed');
    } else {
        legend.classList.remove('closed');
        legend.classList.add('open');
    }
});