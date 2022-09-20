<template>
    <component
        v-if="element && ( ifval )"
        v-bind:is="element.type"
        @mouseenter.stop.prevent="mouseenter"
        @mouseleave.stop.prevent="mouseleave"
        @contextmenu.stop.prevent="clicked"
        v-bind="{...inSlot?.attrs,...element.bind}"
        v-on="{...inSlot?.on,...element.on}"
        :style="style"
        @input="input"
        @change="change"
        :value="val"
        :inputValue="inputValue"
    >
        <template v-for="(template, sk) in slots" v-slot:[template.slot]="bind">
            <elementContainer
                v-for="(child, ck) in template.children"
                :key="`${id||'0'}.${sk}.${ck}`"
                :id="`${id||'0'}.${sk}.${ck}`"
                :inSlot="bind"
                :element="child"
                :selected="localSelected"
                @setSelected="setSelected(child,$event)"
                :values="values"
            />
        </template>

        <template v-if="element.children.length<=0">{{val || element.content }}</template>

        <template v-for="(child, ck) in nonslots">
            <template v-if="child.for">
                <elementContainer
                    v-for="(f, fk) in forVal(child)"
                    :key="`${id||'0'}.${ck}.${fk}`"
                    :id="`${id||'0'}.${ck}.${fk}`"
                    :element="child"
                    :selected="localSelected"
                    @setSelected="setSelected(child,$event)"
                    :values="values"
                    :forVals="localForVals(child,f,fk,ck)"
                />
            </template>
            <template v-else>
                <elementContainer
                    :key="`${id||'0'}.${ck}`"
                    :id="`${id||'0'}.${ck}`"
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
    props: ["element", "selected", "id", "inSlot", "values", "forVals"],
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
        ifval() {
            if (!this.element.if) return true;
            if (this.element.if === true) return true;
            if (this.element.if === false) return false;
            if (this.element.if === "") return true;
            return this.values[this.element.if];
        },
        inputValue() {
            if (this.element?.model) {
                if (
                    this.forVals instanceof Object &&
                    this.forVals[this.element.model] !== undefined
                )
                    return this.forVals[this.element.model];
                else return this.values[this.element.model];
            }
            return this.element?.bind?.inputValue;
        },
        val() {
            if (this.element?.model) {
                if (
                    this.forVals instanceof Object &&
                    this.forVals[this.element.model] !== undefined
                )
                    return this.forVals[this.element.model];
                else return this.values[this.element.model];
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

            let localStyle = selected ? border + backgound : this.outlined;

            let css = this.element.css
                ?.replaceAll("\n", "")
                ?.replaceAll("\r", "");

            return `${localStyle};${css || ""}`;
            // margin: this.localSelected == this.element ? "10px" : null,
            // padding: this.localSelected == this.element ? "10px" : null,
        },
    },
    methods: {
        json(val) {
            if (typeof val == "string" && val.indexOf('"') >= 0) {
                return JSON.parse(val);
            }
            return val;
        },
        forVal(child) {
            let f = this.json(child.for);

            if (f instanceof Object) {
                if (f.value) return f.value;
                if (f.model) {
                    if (
                        this.forVals instanceof Object &&
                        this.forVals[this.element.model] !== undefined
                    ) {
                        if (this.forVals[this.element.model] - 0 > 0)
                            return this.forVals[this.element.model] - 0;
                        return this.forVals[this.element.model];
                    }
                    if (this.values[f.model] - 0 > 0)
                        return this.values[f.model] - 0;
                    return this.values[f.model];
                }
            } else {
                if (f - 0 > 0) return f - 0;
                return f;
            }
        },
        localForVals(child, fVal, fKey, pk) {
            let key = `for.${this.id || "0"}.${pk}`;

            let f = this.json(child.for);

            if (f instanceof Object && f.key) {
                key = f.key;
            }

            let val = {};
            val[key] = fVal;

            return { ...this.forVals, ...val };
        },
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
        mouseenter() {
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