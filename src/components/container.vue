<template>
    <component
        v-if="element && ( ifval )"
        v-bind:is="element.type"
        @mouseenter.stop.prevent="mouseenter"
        @mouseleave.stop.prevent="mouseleave"
        @contextmenu.stop.prevent="clicked"
        v-bind="vbind"
        v-on="von"
        :style="style"
        @input="input"
        @change="change"
        :value="val"
        :inputValue="inputValue"
    >
        <template v-if="element.children.length<=0">{{val || element.content }}</template>

        <template v-for="(slot,sk) in slots1" v-slot:[slot.slot1]="slotObj">
            <template v-if="slot.children.length<=0">{{ slot.content }}</template>
            <elementContainer
                v-for="(child, ck) in slot.children"
                :key="`${id||'0'}.${sk}.${ck}`"
                :id="`${id||'0'}.${sk}.${ck}`"
                :inSlot="{name:slot.slot, value:slotObj}"
                :element="child"
                :selected="localSelected"
                @setSelected="setSelected(child,$event)"
                :values="values"
                :localVals="thisLocalVals"
            />
        </template>
        <template v-for="(slot,sk) in slots2" v-slot:[slot.slot2]>
            <template v-if="slot.children.length<=0">{{ slot.content }}</template>
            <elementContainer
                v-for="(child, ck) in slot.children"
                :key="`${id||'0'}.${sk}.${ck}`"
                :id="`${id||'0'}.${sk}.${ck}`"
                :element="child"
                :selected="localSelected"
                @setSelected="setSelected(child,$event)"
                :values="values"
                :localVals="thisLocalVals"
            />
        </template>

        <template v-for="(child, ck) in nonslots">
            <template v-if="child.for && (child.forVal || child.forKey)">
                <elementContainer
                    v-for="(f, fk) in forExpr(child)"
                    :key="`${id||'0'}.${ck}.${fk}`"
                    :id="`${id||'0'}.${ck}.${fk}`"
                    :element="child"
                    :selected="localSelected"
                    @setSelected="setSelected(child,$event)"
                    :values="values"
                    :localVals="getLocalVals(child,f,fk)"
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
                    :localVals="thisLocalVals"
                />
            </template>
        </template>
    </component>
</template>

<script>
export default {
    name: "elementContainer",
    //inheritAttrs:false,
    props: ["element", "selected", "id", "inSlot", "values", "localVals"],
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
        thisLocalVals() {
            let vals = this.localVals
                ? JSON.parse(JSON.stringify(this.localVals))
                : {};
            if (this.inSlot instanceof Object) {
                vals[this.inSlot.name] = this.inSlot.value;
            }
            return vals;
        },
        vbind() {
            let obj = {};
            Object.keys(this.element.bind).forEach((k) => {
                let v = this.element.bind[k];

                if (String(v).search(/{{(.*?)}}/) >= 0) {
                    obj[k] = String(v).replaceAll(/{{(.*?)}}/g, (m) => {
                        m = m.replaceAll("{", "").replaceAll("}", "");
                        return this.expr(m);
                    });
                } else {
                    obj[k] = v;
                }
            });
            return { ...this.inSlot?.value?.attrs, ...obj };
        },
        von() {
            let obj = {};
            Object.keys(this.element.on).forEach((k) => {
                obj[k] = ($event) =>
                    this.onexpr(this.element.on[k]).call(
                        this.values,
                        this.localVals || {},
                        this.inSlot?.value || {},
                        $event
                    );
            });
            return { ...this.inSlot?.value?.on, ...obj };
        },
        ifval() {
            if (!this.element.if) return true;
            // if (this.element.if === true) return true;
            // if (this.element.if === false) return false;
            // if (this.element.if === "") return true;
            // return this.values[this.element.if];
            return this.expr(this.element.if);
        },
        inputValue() {
            if (this.element?.model) {
                if (
                    this.localVals instanceof Object &&
                    this.localVals[this.element.model] !== undefined
                )
                    return this.localVals[this.element.model];
                else return this.values[this.element.model];
            }
            return this.vbind?.inputValue;
        },
        val() {
            if (this.element?.model) {
                if (
                    this.localVals instanceof Object &&
                    this.localVals[this.element.model] !== undefined
                )
                    return this.localVals[this.element.model];
                else return this.values[this.element.model];
            }
            return this.vbind?.value;
        },
        slots1() {
            return this.element.children.filter(
                (v) => v.type == "slot" || (v.type == "template" && v.slot1)
            );
        },
        slots2() {
            return this.element.children.filter(
                (v) => v.type == "slot" || (v.type == "template" && v.slot2)
            );
        },
        nonslots() {
            let res = this.element.children.filter(
                (v) => v.type != "slot" && v.type != "template"
            );
            //console.log("NO", this.element.type, res);
            return res;
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
        expr(val) {
            let vars = Object.keys(this.localVals || {});
            let s = "";
            if (this.inSlot?.name) s = `const ${this.inSlot.name} = _obj2;`;
            try {
                return Function(
                    "_obj1",
                    "_obj2",
                    `const {${vars}} = _obj1; ${s} return (${val})`
                ).call(
                    this.values,
                    this.localVals || {},
                    this.inSlot?.value || {}
                );
            } catch (e) {
                //console.log(e);
            }
        },
        onexpr(val) {
            let vars = Object.keys(this.localVals || {});
            let s = "";
            if (this.inSlot?.name) s = `const ${this.inSlot.name} = _obj2;`;
            try {
                return Function(
                    "_obj1",
                    "_obj2",
                    "$event",
                    `const {${vars}} = _obj1; ${s} ${val}`
                );
            } catch (e) {
                //console.log(e);
            }
        },

        forExpr(child) {
            return this.expr(child.for) || [];
        },

        getLocalVals(child, fVal, fKey) {
            let vals = this.thisLocalVals
                ? JSON.parse(JSON.stringify(this.thisLocalVals))
                : {};

            if (child.forVal) vals[child.forVal] = fVal;
            if (child.forKey) vals[child.forKey] = fKey;

            return vals;
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