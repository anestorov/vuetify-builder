<template>
    <v-container fluid>
        <v-navigation-drawer right app permanent :width="navWidth" id="nav">
            <div
                id="cell1"
                style="height:50vh; overflow:auto; border:1px solid black; padding:5px; resize: vertical;"
            >
                <treeNode
                    :obj="elements"
                    @select="setSelected"
                    :selected="selected"
                    style="zoom:0.85; line-height: 1em;"
                />
            </div>
            <div style="height:80px; border:1px solid black; padding:5px;">
                <v-row dense>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="addChild(null,true)"
                                    @contextmenu.stop.prevent="addChild(null,false)"
                                    :disabled="!selected"
                                >
                                    <v-icon>mdi-file-document-plus-outline</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">
                                Appends Child
                                <br />
                                <i>Right click to prepend</i>
                            </span>
                        </v-tooltip>
                    </v-col>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="addSibling(null,true)"
                                    @contextmenu.stop.prevent="addSibling(null,false)"
                                    :disabled="!selected"
                                >
                                    <v-icon>mdi-file-arrow-up-down-outline</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">
                                Appends Sibling
                                <br />
                                <i>Right click to prepend</i>
                            </span>
                        </v-tooltip>
                    </v-col>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn icon x-small v-bind="attrs" v-on="on" :disabled="!selected">
                                    <v-icon>mdi-content-save-outline</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">
                                Save Component Bundle
                                <br />
                                <i>to be implemented ...</i>
                            </span>
                        </v-tooltip>
                    </v-col>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="groupToggle()"
                                    :disabled="!selected"
                                >
                                    <v-icon>mdi-table-merge-cells</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">
                                Group / Ungroup Components
                                <br />
                                <i>* Right click component tree</i>
                            </span>
                        </v-tooltip>
                    </v-col>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="copy(true)"
                                    @contextmenu.stop.prevent="copy(false)"
                                    :disabled="!selected"
                                >
                                    <v-icon>mdi-content-copy</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">
                                Copy Component Bundle
                                <br />
                                <i>Right click to copy only selected</i>
                            </span>
                        </v-tooltip>
                    </v-col>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="cut(true)"
                                    @contextmenu.stop.prevent="cut(false)"
                                    :disabled="!selected"
                                >
                                    <v-icon>mdi-content-cut</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">
                                Cut Component Bundle
                                <br />
                                <i>Right click to cut selected only</i>
                            </span>
                        </v-tooltip>
                    </v-col>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="pasteChild(true)"
                                    @contextmenu.stop.prevent="pasteChild(false)"
                                    :disabled="!copyBuffer || !selected"
                                >
                                    <v-icon>mdi-clipboard-plus-outline</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">
                                Paste Appending Child
                                <br />
                                <i>Right click to Prepend</i>
                            </span>
                        </v-tooltip>
                    </v-col>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="pasteSibling(true)"
                                    @contextmenu.stop.prevent="pasteSibling(false)"
                                    :disabled="!copyBuffer || !selected"
                                >
                                    <v-icon>mdi-clipboard-flow-outline</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">
                                Paste Appending Sibling
                                <br />
                                <i>Right click to Prepend</i>
                            </span>
                        </v-tooltip>
                    </v-col>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="copySettings()"
                                    :disabled="!selected"
                                >
                                    <v-icon>mdi-wrench-cog-outline</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">Copy Properties</span>
                        </v-tooltip>
                    </v-col>
                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="pasteSettings()"
                                    :disabled="!settingsBuffer || !selected"
                                >
                                    <v-icon>mdi-wrench-check-outline</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">Paste Properties</span>
                        </v-tooltip>
                    </v-col>

                    <v-col>
                        <v-tooltip top color="success">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="remChild(true)"
                                    @contextmenu.stop.prevent="remChild(false)"
                                    :disabled="!selected"
                                >
                                    <v-icon>mdi-delete-outline</v-icon>
                                </v-btn>
                            </template>
                            <span class="text-caption">
                                Remove Component Bundle
                                <br />
                                <i>Right click to remove selected only</i>
                            </span>
                        </v-tooltip>
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
            <div style="height: calc(50vh - 81px); border:1px solid black; padding:3px;" id="cell2">
                <v-tabs style="zoom:0.8;" grow v-if="selected">
                    <v-tab>Props</v-tab>
                    <v-tab v-if="selected.type=='template' || selected.type=='slot'">Slots</v-tab>
                    <v-tab v-else>Events</v-tab>
                    <v-tab>Data</v-tab>
                    <v-tab>Style</v-tab>

                    <v-tab-item
                        style=" overflow-y:auto; overflow-x: hidden; padding:10px;"
                        class="cell3"
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

                    <v-tab-item
                        style="overflow-y:auto; overflow-x: hidden; padding:10px;"
                        class="cell3"
                    >
                        <v-row v-if="selected && docs" class="MyBolder">
                            <v-col cols="12" v-for="event in docs.events" :key="event.name">
                                <v-text-field
                                    :prefix="`${event.name}: `"
                                    v-model="selected.on[event.name]"
                                    hide-details="auto"
                                ></v-text-field>
                                <span class="text-caption">
                                    {{event.description}}
                                    <ul>
                                        <li v-for="arg in event.arguments" :key="arg.name">
                                            <b>{{arg.name}}</b>
                                            :
                                            {{arg.type}} {{arg.description}}
                                        </li>
                                    </ul>
                                </span>
                            </v-col>
                        </v-row>

                        <v-row v-if="selected && parentSlotDocs" class="MyBolder">
                            <v-col cols="12" v-for="slot in parentSlotDocs" :key="slot.name">
                                <v-row dense v-if="slot['vue-properties']">
                                    <v-col cols="auto">
                                        <v-checkbox
                                            :value="slot.name"
                                            v-model="selected.slot1"
                                            @change="$set(selected,'slot2',undefined)"
                                            :label="slot.name"
                                            hide-details="auto"
                                            class="mb-1"
                                        ></v-checkbox>
                                    </v-col>
                                    <v-col>
                                        <v-text-field
                                            v-if="selected.slot1==slot.name"
                                            v-model="selected.slot"
                                            hide-details="auto"
                                            label="Slot object name"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-checkbox
                                    v-else
                                    :value="slot.name"
                                    v-model="selected.slot2"
                                    @change="$set(selected,'slot1',undefined)"
                                    :label="slot.name"
                                    hide-details="auto"
                                ></v-checkbox>

                                <div class="text-caption">
                                    {{slot.description}}
                                    <ul>
                                        <li v-for="prop in slot['vue-properties']" :key="prop.name">
                                            <b>{{prop.name}}</b>
                                            :
                                            {{prop.type}} {{prop.description}}
                                        </li>
                                    </ul>
                                </div>
                            </v-col>
                        </v-row>
                    </v-tab-item>

                    <v-tab-item
                        style="overflow-y:auto; overflow-x: hidden; padding:10px;"
                        class="cell3"
                    >
                        <v-row v-if="selected && selected.bind">
                            <v-col cols="6">
                                <v-text-field label="if" v-model="selected.if"></v-text-field>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field label="model" v-model="selected.model"></v-text-field>
                            </v-col>

                            <v-col cols="12">
                                <v-text-field label="value" v-model="selected.bind.value"></v-text-field>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field label="For expression" v-model="selected.for"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field label="var name" v-model="selected.forVal"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field label="key name" v-model="selected.forKey"></v-text-field>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field label="text" v-model="selected.bind.text"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field label="html" v-model="selected.bind.html"></v-text-field>
                            </v-col>
                        </v-row>
                        {{variables}}
                    </v-tab-item>

                    <v-tab-item
                        style="overflow-y:auto; overflow-x: hidden; padding:10px;"
                        class="cell3"
                    >
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
    tag.attributes.push({
        name: "title",
        description: "HTMLs title attribute",
    });
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
            navWidth: 350,

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
                window.localStorage.setItem("VueBuild3", JSON.stringify(n));
            },
            deep: true,
        },
        values: {
            handler(n) {
                window.localStorage.setItem("VueBuildData3", JSON.stringify(n));
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
    computed: {
        variables() {
            return Object.keys(this.values);
        },
        parentSlotDocs() {
            if (
                this.selected?.type != "slot" &&
                this.selected?.type != "template"
            )
                return [];

            let camelCased = this.parentOfSelected?.type?.replace(
                /-([a-z])/g,
                function (g) {
                    return g[1].toUpperCase();
                }
            );
            camelCased =
                camelCased.charAt(0).toUpperCase() + camelCased.substring(1);

            return tags[camelCased]?.slots;
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
        copy(all) {
            if (all) {
                this.copyBuffer = JSON.parse(JSON.stringify(this.selected));
            } else {
                let s = JSON.parse(JSON.stringify(this.selected));
                s.children = [];
                this.copyBuffer = s;
            }
        },
        cut(all) {
            this.copy(all);
            this.remChild(all);
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
        remChild(all) {
            if (!this.selected) return;
            if (!this.parentOfSelected) return;

            if (!window.confirm("Do you want to remove that component?"))
                return;
            if (all) {
                let parent = this.parentOfSelected;
                let pos = parent.children.indexOf(this.selected);

                if (pos >= 0) parent.children.splice(pos, 1);

                if (parent.children.length > 0) {
                    if (pos == 0) {
                        this.selected = parent.children[pos];
                    } else if (pos > 0 && pos < parent.children.length - 1)
                        this.selected = parent.children[pos - 1];
                    else
                        this.selected =
                            parent.children[parent.children.length - 1];
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
            } else {
                let parent = this.parentOfSelected;
                let selected = this.selected;

                let pos = parent.children.indexOf(this.selected);

                if (pos >= 0) parent.children.splice(pos, 1);

                selected.children.forEach((c) => {
                    parent.children.push(c);
                });

                this.selected = parent;
                this.parentOfSelected = this._findParent(parent);
            }
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
        let navH = document.querySelector("#nav").offsetHeight;

        new ResizeObserver((entries) => {
            let entry = entries[0];
            let setSize = (w, h) => {
                let c2 = document.querySelector("#cell2");
                let c3s = document.querySelectorAll(".cell3");
                if (c2) c2.style.height = `${navH - h - 81}px`;

                if (c3s) {
                    c3s.forEach((c3) => {
                        c3.style.height = `${(navH - h - 130) / 0.8}px`;
                    });
                }
            };

            if (entry.borderBoxSize) {
                setSize(
                    entry.borderBoxSize[0].inlineSize,
                    entry.borderBoxSize[0].blockSize
                );
            } else {
                setSize(entry.contentRect.width, entry.contentRect.height);
            }
        }).observe(document.querySelector("#cell1"));

        try {
            let structure = window.localStorage.getItem("VueBuild3");
            let data = window.localStorage.getItem("VueBuildData3");

            if (structure) structure = JSON.parse(structure);
            if (structure instanceof Object && structure.type) {
                this.elements = structure;
            } else {
                this.elements = JSON.parse(
                    `{"id":"0","type":"v-container","bind":{},"on":{},"children":[{"type":"v-card","children":[{"type":"v-toolbar","children":[{"type":"span","content":"Label","children":[],"bind":{},"on":{},"model":"title"},{"type":"v-spacer","content":null,"children":[],"bind":{},"on":{}},{"type":"v-btn","children":[{"type":"v-icon","content":"mdi-close","children":[],"bind":{},"on":{}}],"bind":{"icon":true},"on":{}}],"bind":{"height":"30","color":"{{this.color.hexa}}","dark":true},"on":{},"grouped":false},{"type":"v-card-text","children":[{"type":"v-row","children":[{"type":"v-col","children":[{"type":"v-text-field","content":null,"children":[],"bind":{"label":"Number of Lines","hide-details":false,"type":"number"},"on":{},"model":"rows"}],"bind":{},"on":{}},{"type":"v-col","children":[{"type":"v-text-field","content":null,"children":[],"bind":{"label":"Card Title","hide-details":false},"on":{},"model":"title"}],"bind":{},"on":{}},{"type":"v-col","children":[{"type":"v-text-field","children":[{"type":"slot","children":[{"type":"span","children":[],"bind":{"value":"{{counter.props.value}} Letters","class":"text-caption"},"on":{}}],"bind":{"value":""},"on":{},"slot1":"counter","slot":"counter"}],"bind":{"counter":true,"label":"{{this.title}} Save Btn"},"on":{},"model":"save","slot":null}],"bind":{},"on":{}}],"bind":{},"on":{},"grouped":false},{"type":"span","content":"List Items ","children":[],"bind":{"class":"text-h6"},"on":{}},{"type":"v-row","children":[{"type":"v-col","content":null,"children":[{"type":"ul","children":[{"type":"li","children":[{"type":"div","content":null,"children":[],"bind":{"value":"{{forVal}} th Element"},"on":{}}],"bind":{"cols":"12","class":"{{ 'ml-' + forKey }} my-2","value":""},"on":{},"for":"this.rows-0","model":"","forVar":"forVal","forKey":"forKey","forVal":"forVal"}],"bind":{},"on":{}}],"bind":{},"on":{}},{"type":"v-col","children":[{"type":"v-color-picker","content":null,"children":[],"bind":{"hide-inputs":true,"mode":"rgba"},"on":{},"model":"color"}],"bind":{"cols":"auto"},"on":{}}],"bind":{},"on":{}}],"bind":{},"on":{},"grouped":false},{"type":"v-card-actions","children":[{"type":"v-spacer","content":null,"children":[],"bind":{},"on":{}},{"type":"v-btn","content":null,"children":[{"type":"v-icon","content":"mdi-content-save","children":[],"bind":{"left":true},"on":{},"if":""},{"type":"span","content":"Save","children":[],"bind":{"text":""},"on":{},"model":"save"}],"bind":{"title":"opsss","color":"success"},"on":{"click":"if(confirm('Do you want to zero list items?')) this.rows=0;"},"grouped":false,"if":""}],"bind":{},"on":{},"grouped":false}],"bind":{},"on":{},"if":""},{"type":"div","content":"","children":[],"bind":{"text":"","html":""},"on":{}}]}`
                );
                console.log(this.elements);
            }

            if (data) data = JSON.parse(data);
            if (data instanceof Object) {
                this.values = data;
            } else {
                this.values = JSON.parse(
                    `{"rows":"5","color":{"alpha":0.6915890702577395,"hex":"#1243D6","hexa":"#1243D6B0","hsla":{"h":225.04209714515187,"s":0.8450183809280535,"l":0.4552800170898437,"a":0.6915890702577395},"hsva":{"h":225.04209714515187,"s":0.9159999593098959,"v":0.84,"a":0.6915890702577395},"hue":225.04209714515187,"rgba":{"r":18,"g":67,"b":214,"a":0.6915890702577395}},"title":"My Card","save":"Save Me"}`
                );
                console.log(this.values);
            }
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

