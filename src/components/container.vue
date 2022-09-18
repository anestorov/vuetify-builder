<template>
    <component
        v-if="element && ( !element.if || values[element.if])"
        v-bind:is="element.type"
        @mouseenter="mouseenter"
        @mouseleave="mouseleave"
        @contextmenu.stop.prevent="clicked"
        v-bind="{...inSlot?.attrs,...element.bind}"
        v-on="{...inSlot?.on,...element.on}"
        :style="style"
        @input="input"
        @change="change"
        :value="val"
    >
        <template v-for="(template, sk) in slots" v-slot:[template.slot]="bind">
            <elementContainer
                v-for="(child, ck) in template.children"
                :key="`${id||''}.${sk}.${ck}`"
                :id="`${id||''}.${sk}.${ck}`"
                :inSlot="bind"
                :element="child"
                :selected="localSelected"
                @setSelected="setSelected(child,$event)"
                :values="values"
            />
        </template>

        <template v-if="element.content">{{element.model ? values[element.model] : element.content}}</template>

        <template v-for="(child, ck) in nonslots">
            <template v-if="child.for">
                <elementContainer
                    v-for="(f, fk) in child.for-0"
                    :key="`${id||''}.${ck}.${fk}`"
                    :id="`${id||''}.${ck}.${fk}`"
                    :element="child"
                    :selected="localSelected"
                    @setSelected="setSelected(child,$event)"
                    :values="values"
                />
            </template>
            <template v-else>
                <elementContainer
                    :key="`${id||''}.${ck}`"
                    :id="`${id||''}.${ck}`"
                    :element="child"
                    :selected="localSelected"
                    @setSelected="setSelected(child,$event)"
                    :values="values"
                />
            </template>
        </template>
    </component>
</template>

<script>
export default {
    name: "elementContainer",
    //inheritAttrs:false,
    props: ["element", "selected", "id", "inSlot", "values"],
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
        val() {
            if (this.element?.model) {
                return this.values[this.element.model];
            }
            return this.element?.bind?.value;
        },
        slots() {
            return this.element.children.filter(
                (v) => v.type == "slot" || v.type == "template"
            );
        },
        nonslots() {
            return this.element.children.filter(
                (v) => v.type != "slot" && v.type != "template"
            );
        },
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
        input(val) {
            if (this.element?.model)
                this.$set(this.values, this.element.model, val);
            else if (this.element?.on?.input instanceof Function)
                this.element.on.input(val);
        },
        change(val) {
            if (this.element?.model)
                this.$set(this.values, this.element.model, val);
            else if (this.element?.on?.change instanceof Function)
                this.element.on.change(val);
        },
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