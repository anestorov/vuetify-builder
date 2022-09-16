<template>
    <span>
        <div class="container">
            <component v-bind:is="data.type">
                {{data.content}}
                <span class="container" v-for="child in data.children" :key="child.type">
                    <elementContainer :data="child" />
                </span>
            </component>
        </div>
    </span>
</template>

<script>
// import {v-ca} from 'vuetify'
export default {
    name: "elementContainer",
    props: ["data"],
    components: {

    },
    watch: {
        data: {
            handler(n) {
                if(n instanceof Object && n.type) {
                    this.$co
                }
            }
        }
    }
};
</script>

<style>
.container {
    border: 1px, solid black;
}
</style>