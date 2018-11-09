const form = document.querySelector('form');
const name = document.querySelector('#name');
const cost = document.querySelector('#cost');
const error = document.querySelector('#error');


form.addEventListener('submit', (e) => {
    e.preventDefault();

    if( name.value && !isNaN(cost.value) && cost.value  ) {

        const item = {
            name: name.value,
            cost: parseInt(cost.value)
        };

        db.collection('expenses').add(item).then( res => {
            error.textContent = '';
            name.value = '';
            cost.value = '';
        });

    } else if (name.value && isNaN(cost.value) ) {
    
        error.textContent = 'Cost is not a number :(';

    } else {

        error.textContent = 'You missed some values :(';

    }


});

