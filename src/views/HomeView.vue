<template>
    <v-container fluid>
        <v-navigation-drawer right app permanent width="25vw">
            <div style="height:calc(52vh - 135px); overflow:auto; border:1px solid black; padding:5px">
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
                        <v-btn icon x-small @click="addChild()" :disabled="!selected">
                            <v-icon>mdi-new-box</v-icon>
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
                        <v-btn icon x-small @click="paste()" :disabled="!copyBuffer || !selected">
                            <v-icon>mdi-content-paste</v-icon>
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
                        <v-autocomplete
                            label="element"
                            :items="tagList"
                            v-model="selected.type"
                            hide-details="auto"
                            dense
                        ></v-autocomplete>
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
            <div style="border:1px solid black; padding:5px">
                <v-tabs style="zoom:0.8">
                    <v-tab>Props</v-tab>
                    <v-tab>Slots</v-tab>
                    <v-tab>Bind</v-tab>
                    <v-tab>CSS</v-tab>

                    <v-tab-item style="height:60vh ; overflow-y:auto; overflow-x: hidden;">
                        <v-row v-if="docs" dense>
                            <v-col cols="12" v-for="attr in docs.attributes" :key="attr.name">
                                <template v-if="(attr.value && attr.value.type instanceof Array)">
                                    <!-- <span v-for="(t,k) in attr.value.type" :key="'t'+k"></span> -->
                                    <v-text-field
                                        :prefix="attr.name+': '"
                                        v-model="selected.bind[attr.name]"
                                        hide-details="auto"
                                        dense
                                        :hint="attr.description"
                                    >
                                        <template v-slot:prepend-inner>
                                            <v-checkbox
                                                v-if="attr.value.type.indexOf('boolean')>=0"
                                                class="mb-2"
                                                v-model="selected.bind[attr.name]"
                                                hide-details="auto"
                                                :false-value="null"
                                                dense
                                            ></v-checkbox>
                                        </template>
                                    </v-text-field>
                                </template>
                                <v-text-field
                                    v-else-if="attr.value.type=='string'"
                                    :prefix="attr.name+': '"
                                    v-model="selected.bind[attr.name]"
                                    hide-details="auto"
                                    dense
                                    :hint="attr.description"
                                ></v-text-field>

                                <v-input
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
                                        :label="attr.name"
                                        v-model="selected.bind[attr.name]"
                                        hide-details="auto"
                                        dense
                                        :false-value="null"
                                    ></v-checkbox>
                                </v-input>

                                <!-- <i class="caption">{{attr.description}}</i> -->
                            </v-col>
                        </v-row>
                    </v-tab-item>

                    <v-tab-item>
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

                    <v-tab-item></v-tab-item>
                </v-tabs>
            </div>
        </v-navigation-drawer>
        <elementContainer @setSelected="setSelected" :selected="selected" :element="elements"></elementContainer>
        <!-- <pre>{{elements}}</pre> -->
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
        copy() {
            this.copyBuffer = this.selected;
        },
        cut() {
            this.copyBuffer = this.selected;
            this.remChild();
        },
        paste() {
            if (!this.copyBuffer) {
                alert("Nothing copied!");
                return;
            }

            this.addChild(this.copyBuffer);
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
        addChild(proto) {
            if (!this.selected) return;

            if (!this.selected?.children) {
                this.$set(this.selected, "children", []);
            }

            let newElm = null;

            if (proto) {
                newElm = JSON.parse(JSON.stringify(proto));
            } else {
                newElm = {
                    type: "v-container",
                    content: null,
                    children: [],
                    bind: {},
                    on: {},
                };
            }

            this.selected.children.push(newElm);
            this.$set(this.selected, "content", undefined);
            if (!proto) this.selected = newElm;
        },
        remChild() {
            console.log("rem", this.selected, this.parentOfSelected);
            if (!this.selected) return;
            if (!this.parentOfSelected) return;

            let parent = this.parentOfSelected;
            let pos = parent.children.indexOf(this.selected);

            console.log(parent, pos);
            if (pos >= 0) parent.children.splice(pos, 1);
        },
        // getVal(prop) {
        //     let val = this.selected?.bind?.[prop];
        //     if (prop == "dense") console.log(prop, val);
        //     return val;
        // },
        // setVal(prop, val) {
        //     if (val == "false") val = false;
        //     if (val == "true") val = true;

        //     if (!this.selected?.bind) this.$set(this.selected, "bind", {});
        //     this.$set(this.selected.bind, prop, val === null ? false : val);

        //     if (val === null) delete this.selected.bind[prop];
        // },
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

