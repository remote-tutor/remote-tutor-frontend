import {required, email, confirmed, excluded, numeric, max, min, image, required_if, min_value} from 'vee-validate/dist/rules';
import {extend} from 'vee-validate';

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
    params: ['length'],
    message: 'Maximum is {length} characters'
})

extend('min', {
    ...min,
    params: ['length'],
    message: 'Minimum is {length} characters'
})

extend('min_value', {
    ...min_value,
    message: 'Minimum is {min} or more'
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

extend('username', {
    validate: value => {
        let regex = new RegExp("^(?=.{5,20})")
        if (!regex.test(value))
            return 'Username length must be 5 to 20 characters long'
        regex = new RegExp("(\\s)")
        if (regex.test(value))
            return 'Username cannot contain spaces'
        regex = new RegExp("^[a-zA-Z0-9._]+$")
        if (!regex.test(value))
            return 'The allowed characters are a-z, A-Z, 0-9, dot(.), and underscore(_)'
        regex = new RegExp("^(?![_.0-9])")
        if (!regex.test(value))
            return 'Username must start with a letter'
        regex = new RegExp("^(?!.*[_.]{2})")
        if (!regex.test(value))
            return 'You cannot have 2 consecutive special characters'
        regex = new RegExp("(?<![_.])$")
        if (!regex.test(value))
            return 'You cannot have a special character at the end'
        return true
    },
})

// extend('min', {
//     ...min,
//     params: ['length'],
//     message: 'يجب الا تقل {_field_} عن {length}'
// })