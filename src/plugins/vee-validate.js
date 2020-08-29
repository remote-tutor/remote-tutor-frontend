import { required, email, confirmed, excluded, numeric, max } from 'vee-validate/dist/rules';
import { extend } from 'vee-validate';

extend('required', {
    ...required,
    lazy: true,
    message: 'This field is required'
});

extend('email', {
    ...email,
});

extend('confirmed', {
    ...confirmed,
    message: 'These fields must match',
})

extend('excluded', {
    ...excluded,
    message: 'You must select a valid option'
})

extend('numeric', {
    ...numeric,
    message: 'Numbers Only'
})

extend('max', {
    ...max, 
    message: 'You exceeded the max'
})

// extend('min', {
//     ...min,
//     params: ['length'],
//     message: 'يجب الا تقل {_field_} عن {length}'
// })