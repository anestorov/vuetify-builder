<template>
    <component
        v-if="element"
        v-bind:is="element.type"
        @mouseenter="mouseenter"
        @mouseleave="mouseleave"
        @contextmenu.stop.prevent="clicked"
        v-bind="element.bind"
        v-on="element.on"
        :style="style"
    >
        <template v-if="element.content">{{element.content}}</template>

        <elementContainer
            v-else
            v-for="child in element.children"
            :key="child.id"
            :element="child"
            :selected="localSelected"
            @setSelected="setSelected"
        />
    </component>
</template>

<script>
export default {
    name: "elementContainer",
    props: ["element", "selected"],
    data() {
        return {
            localSelected: false,
            outlined: false,
        };
    },
    watch: {
        selected: {
            handler(n) {
                if (n !== this.localSelected) this.localSelected = n;
            },
            immediate: true,
        },
    },
    computed: {
        cStyle() {
            return {};
        },
        style() {
            return {
                margin: this.localSelected == this.element ? "10px" : null,
                padding: this.localSelected == this.element ? "10px" : null,
                border:
                    this.localSelected == this.element
                        ? "1px solid green"
                        : this.localSelected && this.outlined
                        ? "1px dashed gray"
                        : null,
            };
        },
    },
    methods: {
        setSelected(event) {
            this.localSelected = event;

            this.$emit("setSelected", event);
        },
        clicked() {
            if (this.localSelected !== this.element)
                this.localSelected = this.element;
            else this.localSelected = null;

            this.$emit("setSelected", this.localSelected);
        },
        mouseenter(event) {
            event.preventDefault();
            event.stopPropagation();
            this.outlined = true;
        },
        mouseleave() {
            this.outlined = false;
        },
    },
};
</script>

<style scoped>
</style>