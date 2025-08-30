import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config';
import '@primeuix/themes/aura';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
// ...importas iš @primeuix/core pašalintas, nes paketas neegzistuoja...
import 'primeicons/primeicons.css';
import Button from 'primevue/button';



import Tree from 'primevue/tree';


const app = createApp(App)

const DarkPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{zinc.50}',
            100: '{zinc.100}',
            200: '{zinc.200}',
            300: '{zinc.300}',
            400: '{zinc.400}',
            500: '{zinc.500}',
            600: '{zinc.600}',
            700: '{zinc.700}',
            800: '{zinc.800}',
            900: '{zinc.900}',
            950: '{zinc.950}'
        },
        red: {
            50: '{red.50}',
            100: '{red.100}',
            200: '{red.200}',
            300: '{red.300}',
            400: '{red.400}',
            500: '{red.500}',
            600: '{red.600}',
            700: '{red.700}',
            800: '{red.800}',
            900: '{red.900}',
            950: '{red.950}'
        }
    }
});

app.use(PrimeVue, {
    theme: {
        preset: DarkPreset
    }
});



app.use(createPinia())
app.use(router)

app.component('Tree', Tree).component('Button', Button);


app.mount('#app')
