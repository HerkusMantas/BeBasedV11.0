<template>
    <div>
        <h1>Log In</h1>
        <form @submit.prevent="handleSubmit">
            <div>
                <label for="username">Username:</label>
                <input type="text" id="username" v-model="username" />
            </div>
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password" v-model="password" />
            </div>
            <button type="submit">Log In</button>
        </form>
    </div>
</template>

<script setup>

import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const username = ref('');
const password = ref('');

function handleSubmit() {
  router.push('/home');
}

</script>