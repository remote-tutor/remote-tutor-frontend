import { required, email, confirmed, excluded, numeric, max, image, required_if } from 'vee-validate/dist/rules';
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

extend('image', {
    ...image,
    message: 'You must upload an image'
})

extend('required_if', {
    ...required_if,
    validate: (value, args) => {
        let targetValue = args.target
        let validValue = (value === undefined || value.length === 0)
        let validTargetValue = (targetValue === undefined || targetValue.length === 0)
        return !(validValue && validTargetValue);

    },
    message: 'You must upload an image or enter text'
})

// extend('min', {
//     ...min,
//     params: ['length'],
//     message: 'يجب الا تقل {_field_} عن {length}'
// })