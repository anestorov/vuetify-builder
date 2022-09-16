<template>
    <span>
        <elementContainer :data="elements"></elementContainer>
    </span>
</template>

<script>
import elementContainer from "@/components/container.vue";
export default {
    name: "HomeView",
    components: { elementContainer },
    data() {
        return {
            elements: {
                type: "v-card",
                children: [{ type: "v-card-title", content: "test" }],
            },
        };
    },
};
</script>

