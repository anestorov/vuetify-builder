<template>
    <v-container fluid>
        <v-navigation-drawer right app permanent width="25vw">
            <div
                style="height:calc(52vh - 135px); overflow:auto; border:1px solid black; padding:5px"
            >
                <treeNode
                    :obj="elements"
                    @select="setSelected"
                    :selected="selected"
                    style="zoom:1; line-height: 1em;"
                />
            </div>
            <div style="height:80px; border:1px solid black; padding:5px">
                <v-row dense>
                    <v-col>
                        <v-btn
                            icon
                            x-small
                            @click="addChild(null,true)"
                            @contextmenu.stop.prevent="addChild(null,false)"
                            :disabled="!selected"
                        >
                            <v-icon>mdi-file-document-plus-outline</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn
                            icon
                            x-small
                            @click="addSibling(null,true)"
                            @contextmenu.stop.prevent="addSibling(null,false)"
                            :disabled="!selected"
                        >
                            <v-icon>mdi-file-arrow-up-down-outline</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn icon x-small @click="groupToggle()" :disabled="!selected">
                            <v-icon>mdi-table-merge-cells</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn icon x-small @click="copy()" :disabled="!selected">
                            <v-icon>mdi-content-copy</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn icon x-small @click="cut()" :disabled="!selected">
                            <v-icon>mdi-content-cut</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn
                            icon
                            x-small
                            @click="pasteChild(true)"
                            @contextmenu.stop.prevent="pasteChild(false)"
                            :disabled="!copyBuffer || !selected"
                        >
                            <v-icon>mdi-clipboard-plus-outline</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn
                            icon
                            x-small
                            @click="pasteSibling(true)"
                            @contextmenu.stop.prevent="pasteSibling(false)"
                            :disabled="!copyBuffer || !selected"
                        >
                            <v-icon>mdi-clipboard-flow-outline</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn icon x-small @click="copySettings()" :disabled="!selected">
                            <v-icon>mdi-wrench-cog-outline</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn
                            icon
                            x-small
                            @click="pasteSettings()"
                            :disabled="!settingsBuffer || !selected"
                        >
                            <v-icon>mdi-wrench-check-outline</v-icon>
                        </v-btn>
                    </v-col>

                    <v-col>
                        <v-btn icon x-small @click="remChild()" :disabled="!selected">
                            <v-icon>mdi-delete-outline</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row v-if="selected" dense>
                    <v-col cols="6">
                        <v-combobox
                            label="element"
                            :items="tagList"
                            v-model="selected.type"
                            hide-details="auto"
                            dense
                        ></v-combobox>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field
                            label="content"
                            v-model="selected.content"
                            hide-details="auto"
                            dense
                        ></v-text-field>
                    </v-col>
                </v-row>
            </div>
            <div style="border:1px solid black; padding:3px">
                <v-tabs style="zoom:0.8">
                    <v-tab>Props</v-tab>
                    <v-tab>Slots</v-tab>
                    <v-tab>Data</v-tab>
                    <v-tab>CSS</v-tab>

                    <v-tab-item
                        style="height:60vh ; overflow-y:auto; overflow-x: hidden; padding:10px"
                    >
                        <v-row v-if="docs" dense class="MyBolder">
                            <v-col cols="12" v-for="attr in docs.attributes" :key="attr.name">
                                <!-- <template
                                    v-if="(attr.value && (attr.value.type=='any' || attr.value.type instanceof Array))"
                                >-->
                                <!-- <span v-for="(t,k) in attr.value.type" :key="'t'+k"></span> -->
                                <v-text-field
                                    :prefix="attr.name+': '"
                                    v-model="selected.bind[attr.name]"
                                    hide-details="auto"
                                    dense
                                    :hint="attr.description"
                                >
                                    <template v-slot:append>
                                        <v-btn class="mt-3" icon x-small @click="clear(attr.name)">
                                            <v-icon>mdi-close-circle-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <template v-slot:prepend-inner>
                                        <v-checkbox
                                            class="mb-2"
                                            v-model="selected.bind[attr.name]"
                                            hide-details="auto"
                                            :false-value="null"
                                            dense
                                        ></v-checkbox>
                                    </template>
                                </v-text-field>
                                <!-- </template> -->

                                <!-- <v-input
                                    v-else-if="attr.value.type=='boolean'"
                                    :hint="attr.description"
                                    hide-details="auto"
                                    dense
                                    :persistent-hint="hints[attr.name]"
                                >
                                    <template v-slot:append>
                                        <v-btn
                                            icon
                                            x-small
                                            @click="$set(hints,attr.name,!hints[attr.name])"
                                        >
                                            <v-icon
                                                v-if="hints[attr.name]"
                                            >mdi-information-off-outline</v-icon>
                                            <v-icon v-else>mdi-information-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-checkbox
                                        style="color:black"
                                        :label="attr.name"
                                        v-model="selected.bind[attr.name]"
                                        hide-details="auto"
                                        dense
                                        :false-value="null"
                                    ></v-checkbox>
                                </v-input>

                                <v-text-field
                                    v-else
                                    :prefix="attr.name+': '"
                                    v-model="selected.bind[attr.name]"
                                    hide-details="auto"
                                    dense
                                    :hint="attr.description"
                                ></v-text-field>-->
                            </v-col>
                        </v-row>
                    </v-tab-item>

                    <v-tab-item style="height:60vh ; overflow-y:auto; overflow-x: hidden;">
                        <ul v-if="docs">
                            <li v-for="slot in docs.slots" :key="slot.name">
                                <b>{{slot.name}}</b>
                                :
                                {{slot.description}}
                                <ul>
                                    <li v-for="prop in slot['vue-properties']" :key="prop.name">
                                        <b>{{prop.name}}</b>
                                        :
                                        {{prop.type}} {{prop.description}}
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <br />
                        <hr />
                        <br />
                        <ul v-if="docs">
                            <li v-for="event in docs.events" :key="event.name">
                                <b>{{event.name}}</b>
                                :
                                {{event.description}}
                                <ul>
                                    <li v-for="arg in event.arguments" :key="arg.name">
                                        <b>{{arg.name}}</b>
                                        :
                                        {{arg.type}} {{arg.description}}
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </v-tab-item>

                    <v-tab-item style="height:60vh ; overflow-y:auto; overflow-x: hidden;">
                        <v-row v-if="selected && selected.bind">
                            <v-col cols="6">
                                <v-text-field label="value" v-model="selected.bind.value"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field label="items" v-model="selected.bind.items"></v-text-field>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field label="slot" v-model="selected.slot"></v-text-field>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field label="for" v-model="selected.for"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-tab-item>

                    <v-tab-item style="height:60vh ; overflow-y:auto; overflow-x: hidden;">
                        <v-row v-if="selected && selected.bind">
                            <v-col dense cols="12" class="mt-2">
                                <v-textarea
                                    label="class"
                                    v-model="selected.bind.class"
                                    hide-details="auto"
                                    outlined
                                    height="200"
                                ></v-textarea>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea
                                    label="css"
                                    v-model="selected.css"
                                    hide-details="auto"
                                    outlined
                                    height="200"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                </v-tabs>
            </div>
        </v-navigation-drawer>
        <elementContainer
            @setSelected="setSelected"
            :selected="selected"
            :element="elements"
            :values="values"
        ></elementContainer>
    </v-container>
</template>

<script>
import vueTags from "vuetify/dist/json/tags.json";
import webtypes from "vuetify/dist/json/web-types.json";
import treeNode from "@/components/treeNode.vue";

let tags = {};
webtypes.contributions.html.tags.forEach((tag) => {
    tags[tag.name] = tag;
});

import elementContainer from "@/components/container.vue";
export default {
    name: "HomeView",
    components: { elementContainer, treeNode },
    data() {
        return {
            tagList: Object.keys(vueTags),
            selected: null,
            parentOfSelected: null,
            docs: {},
            copyBuffer: null,
            settingsBuffer: null,
            hints: {},

            elements: {
                id: "0",
                type: "v-container",
                content: "EMPTY CONTAINER",
                bind: {},
                on: {},
                children: [],
            },
            values: {},
        };
    },
    watch: {
        elements: {
            handler(n) {
                window.localStorage.setItem("vueBuild", JSON.stringify(n));
            },
            deep: true,
        },
        "selected.type": {
            handler(n) {
                if (!n) {
                    this.docs = null;
                    return;
                }

                var camelCased = n.replace(/-([a-z])/g, function (g) {
                    return g[1].toUpperCase();
                });
                camelCased =
                    camelCased.charAt(0).toUpperCase() +
                    camelCased.substring(1);

                this.docs = tags[camelCased];
            },
        },
    },
    methods: {
        clear(param) {
            this.$set(this.selected.bind, param, undefined);
            // setTimeout(() => {
            //     this.selected.bind[param] = undefined;
            // }, 10);
        },
        groupToggle() {
            if (!this.selected) return;

            this.$set(this.selected, "grouped", !this.selected.grouped);
        },
        copy() {
            this.copyBuffer = this.selected;
        },
        cut() {
            this.copyBuffer = this.selected;
            this.remChild();
        },
        pasteSibling(append) {
            if (!this.copyBuffer) {
                alert("Nothing copied!");
                return;
            }

            this.addSibling(this.copyBuffer, append);
        },
        pasteChild(append) {
            if (!this.copyBuffer) {
                alert("Nothing copied!");
                return;
            }

            this.addChild(this.copyBuffer, append);
        },
        copySettings() {
            this.settingsBuffer = this.selected;
        },
        pasteSettings() {
            if (
                !this.settingsBuffer ||
                this.selected.type != this.settingsBuffer.type
            ) {
                alert("Copied settings does not match current object!");
                return;
            }

            this.$set(this.selected, "bind", { ...this.settingsBuffer.bind });
        },
        addSibling(proto, append) {
            if (!this.selected) return;
            if (!this.parentOfSelected?.children) return;

            let pos = this.parentOfSelected.children.indexOf(this.selected);

            let newElm = null;
            if (proto) {
                newElm = JSON.parse(JSON.stringify(proto));
            } else {
                newElm = {
                    type: "div",
                    content: null,
                    children: [],
                    bind: {},
                    on: {},
                };
            }

            if (append) {
                this.parentOfSelected.children.splice(pos + 1, 0, newElm);
            } else {
                this.parentOfSelected.children.splice(pos, 0, newElm);
            }

            if (!proto) {
                this.selected = newElm;
            }
        },
        addChild(proto, append) {
            if (!this.selected) return;

            if (!this.selected?.children) {
                this.$set(this.selected, "children", []);
            }

            let newElm = null;

            if (proto) {
                newElm = JSON.parse(JSON.stringify(proto));
            } else {
                newElm = {
                    type: "div",
                    content: null,
                    children: [],
                    bind: {},
                    on: {},
                };
            }

            if (append) {
                this.selected.children.push(newElm);
            } else {
                this.selected.children.splice(0, 0, newElm);
            }

            this.$set(this.selected, "content", undefined);
            if (!proto) {
                this.parentOfSelected = this.selected;
                this.selected = newElm;
            }
        },
        remChild() {
            if (!this.selected) return;
            if (!this.parentOfSelected) return;

            let parent = this.parentOfSelected;
            let pos = parent.children.indexOf(this.selected);

            console.log(parent, pos);
            if (pos >= 0) parent.children.splice(pos, 1);

            if (parent.children.length > 0) {
                if (pos == 0) {
                    this.selected = parent.children[pos];
                } else if (pos > 0 && pos < parent.children.length - 1)
                    this.selected = parent.children[pos - 1];
                else
                    this.selected = parent.children[parent.children.length - 1];
            } else {
                let newParent = this._findParent(this.parentOfSelected);
                if (newParent) {
                    console.log(newParent);
                    this.selected = this.parentOfSelected;
                    this.parentOfSelected = newParent;
                } else {
                    this.selected = null;
                    this.parentOfSelected = null;
                }
            }

            console.log(this.selected, this.parentOfSelected);
        },

        _findParent(current, obj) {
            if (!obj) obj = this.elements;
            if (!(obj instanceof Object)) return;

            if (obj.children instanceof Array) {
                if (obj.children.indexOf(current) >= 0) return obj;
                for (let i = 0; i < obj.children.length; i++) {
                    if (obj.children[i] instanceof Object) {
                        let res = this._findParent(current, obj.children[i]);
                        if (res) return res;
                    }
                }
            }
        },

        setSelected(obj) {
            //console.log("select", obj);
            this.parentOfSelected = obj.parent;
            this.selected = obj.selected;
        },
    },
    mounted() {
        try {
            let data = window.localStorage.getItem("vueBuild");
            if (data) data = JSON.parse(data);
            if (data instanceof Object && data.type) this.elements = data;
        } catch (e) {
            console.log(e);
        }
    },
};
</script>

<style>
.MyBolder label,
.MyBolder .v-text-field__prefix {
    color: black !important;
    font-weight: bold;
}
</style>

