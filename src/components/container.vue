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
            v-for="(child, ck) in element.children"
            :key="`${id||''}.${ck}`"
            :id="`${id||''}.${ck}`"
            :element="child"
            :selected="localSelected"
            @setSelected="setSelected(child,$event)"
        />
    </component>
</template>

<script>
export default {
    name: "elementContainer",
    //inheritAttrs:false,
    props: ["element", "selected", "id"],
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
        style() {
            let selected = this.localSelected == this.element;
            let border = "border: 1px dashed orange;";
            let backgound = `background-image: repeating-linear-gradient(-45deg,transparent,transparent 20px,rgba(0,0,0,0.03) 20px,rgba(0,0,0,0.03) 40px);`;

            let localStyle = selected ? border + backgound : "";

            let css = this.element.css
                ?.replaceAll("\n", "")
                ?.replaceAll("\r", "");

            return `${localStyle};${css || ""}`;
            // margin: this.localSelected == this.element ? "10px" : null,
            // padding: this.localSelected == this.element ? "10px" : null,
        },
    },
    methods: {
        setSelected(child, event) {
            this.localSelected = event.selected;

            if (child === event.selected) event["parent"] = this.element;

            this.$emit("setSelected", event);
        },
        clicked() {
            if (this.localSelected !== this.element)
                this.localSelected = this.element;
            else this.localSelected = null;

            this.$emit("setSelected", { selected: this.localSelected });
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