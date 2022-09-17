<template>
    <div v-if="obj">
        <table dropzone="true" @dragover.prevent.stop="dragover" @drop.stop="drop(null,$event)">
            <tr>
                <td colspan="2">
                    <a
                        :class="obj.id"
                        :draggable="!!parent"
                        @dragstart="dragstart"
                        @dragend="dragend"
                        href="#"
                        @click.prevent="$emit('select', {selected: obj!==selected ? obj: null, parent})"
                        @contextmenu.stop.prevent="$set(obj,'grouped',!obj.grouped)&&$emit('select', {selected: obj!==selected ? obj: null, parent})"
                        :style="style"
                    >
                        <span v-if="obj.grouped">
                            {&nbsp;
                            <b v-if="obj===selected">{{obj.type || 'empty'}}</b>
                            <i v-else>{{obj.type || 'empty'}}</i>&nbsp;}
                        </span>
                        <span v-else>
                            <b v-if="obj===selected">{{obj.type || 'empty'}}</b>
                            <i v-else>{{obj.type || 'empty'}}</i>
                        </span>
                    </a>
                </td>
            </tr>
            <tr v-if="acceptChild" style="color:green">
                <td style="width:15px; white-space: noWrap">|--></td>
                <td>
                    <i v-if="(localDragged instanceof Object)">{{localDragged.obj.type}}</i>
                    <!-- <treeNode
                        v-if="(localDragged instanceof Object)"
                        :obj="localDragged.obj"
                        :id="`child_${id||''}`"
                        :adding="true"
                    />-->
                </td>
            </tr>
        </table>
        <template v-if="!obj.grouped">
            <table
                v-for="(child,ck) in obj.children"
                :key="`${id||''}.${ck}`"
                dropzone="true"
                @dragover.prevent.stop="dragoverChild(ck)"
                @drop.stop="drop(ck,$event)"
                style="width:100%"
            >
                <tr>
                    <td style="width:15px; vertical-align: top;">
                        |
                        <hr />
                    </td>
                    <td>
                        <treeNode
                            v-if="(child instanceof Object)"
                            :obj="child"
                            :id="`${id||''}.${ck}`"
                            :dragged="localDragged"
                            @dragged="childDragged"
                            :accepting="acceptSibling==ck"
                            @select="$emit('select',$event)"
                            :selected="selected"
                            :deleteMe="deleteMeFn(ck)"
                            :parent="obj"
                            :dragging="isDragging"
                            :adding="adding"
                        />
                    </td>
                </tr>

                <tr v-if="acceptSibling == ck" style="color:green">
                    <td style="width:15px; white-space: noWrap">|--></td>
                    <td>
                        <i v-if="(localDragged instanceof Object)">{{localDragged.obj.type}}</i>
                        <!-- <treeNode
                        v-if="(localDragged instanceof Object)"
                        :obj="localDragged.obj"
                        :id="`siblig_${id||''}.${ck}`"
                        :adding="true"
                        />-->
                    </td>
                </tr>
            </table>
        </template>
    </div>
</template>

<script>
export default {
    name: "treeNode",
    props: [
        "id",
        "obj",
        "deleteMe",
        "selected",
        "accepting",
        "dragged",
        "parent",
        "dragging",
        "adding",
    ],
    data() {
        return {
            acceptChild: false,
            acceptSibling: null,
            sibligTimeout: null,
            childTimeout: null,
            localDragged: null,
        };
    },
    watch: {
        dragged(n) {
            if (n != this.localDragged) this.localDragged = n;
        },
    },
    computed: {
        isDragging() {
            return this.dragging || this.localDragged?.obj == this.obj;
        },
        style() {
            return {
                opacity: this.isDragging ? "0.2" : null,
                color:
                    this.acceptChild || this.accepting
                        ? "orange"
                        : this.adding
                        ? "green"
                        : null,
            };
        },
    },
    methods: {
        dragover() {
            if (!this.acceptChild) this.acceptChild = true;

            if (this.childTimeout) clearTimeout(this.childTimeout);
            this.childTimeout = setTimeout(() => {
                this.acceptChild = false;
            }, 100);
        },
        dragoverChild(k) {
            if (this.acceptSibling != k) this.acceptSibling = k;

            if (this.sibligTimeout) clearTimeout(this.sibligTimeout);
            this.sibligTimeout = setTimeout(() => {
                this.acceptSibling = null;
            }, 100);
        },
        drop(k) {
            if (!(this.localDragged instanceof Object)) return;
            if (!(this.localDragged.obj instanceof Object)) return;

            let obj = this.localDragged.obj;
            let children = this.obj.children;

            let pos = children.indexOf(obj);

            if (k === null) k = 0;
            else k++;

            if (pos >= 0 && pos < k) k--;

            if (this.localDragged.delete instanceof Function)
                this.localDragged.delete();

            children.splice(k, 0, obj);
        },
        dragstart() {
            (this.localDragged = { obj: this.obj, delete: this.deleteMe }),
                this.$emit("dragged", this.localDragged);
        },
        dragend() {
            this.localDragged = null;
            this.$emit("dragged", this.localDragged);
        },
        childDragged(child) {
            this.localDragged = child;
            this.$emit("dragged", this.localDragged);
        },

        deleteMeFn(ck) {
            return () => {
                let children = this.obj?.children;
                if (children instanceof Array) children.splice(ck, 1);
            };
        },
    },
};
</script>

<style>
.dragged {
    color: gainsboro;
}
</style>


