<template>
    <v-container fluid>
        <v-navigation-drawer right app permanent width="25vw">
            <v-container fluid>
                <v-row v-if="selected" dense>
                    <v-col cols="12">
                        <v-btn icon small @click="addChild" :disabled="!selected.type">
                            <v-icon>mdi-plus-outline</v-icon>
                        </v-btn>
                        <v-btn icon small @click="remChild" :disabled="!selected.type">
                            <v-icon>mdi-close-outline</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-autocomplete
                            label="element"
                            :items="tagList"
                            v-model="selected.type"
                            hide-details="auto"
                        ></v-autocomplete>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field
                            label="content"
                            v-model="selected.content"
                            hide-details="auto"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-tabs style="zoom:0.8">
                    <v-tab>Props</v-tab>
                    <v-tab>Slots</v-tab>
                    <v-tab>Bind</v-tab>
                    <v-tab>CSS</v-tab>

                    <v-tab-item>
                        <v-row v-if="docs" dense>
                            <v-col cols="12" v-for="attr in docs.attributes" :key="attr.name">
                                <template v-if="(attr.value && attr.value.type instanceof Array)">
                                    <!-- <span v-for="(t,k) in attr.value.type" :key="'t'+k"></span> -->
                                    <v-text-field
                                        :prefix="attr.name+': '"
                                        :value="getVal(attr.name)"
                                        @input="setVal(attr.name, $event)"
                                        hide-details="auto"
                                        :placeholder="String(attr.value.type)"
                                        dense
                                    >
                                        <template v-slot:append>
                                            <v-checkbox
                                                v-if="attr.value.type.indexOf('boolean')>=0"
                                                :value="getVal(attr.name)"
                                                @change="setVal(attr.name, $event)"
                                                hide-details="auto"
                                                dense
                                            ></v-checkbox>
                                        </template>
                                    </v-text-field>
                                </template>
                                <v-text-field
                                    v-else-if="attr.value.type=='string'"
                                    :prefix="attr.name+': '"
                                    :value="getVal(attr.name)"
                                    @input="setVal(attr.name, $event)"
                                    hide-details="auto"
                                    :placeholder="attr.value.type"
                                    dense
                                ></v-text-field>
                                <v-checkbox
                                    v-else-if="attr.value.type=='boolean'"
                                    :label="attr.name"
                                    :value="getVal(attr.name)"
                                    @change="setVal(attr.name, $event)"
                                    hide-details="auto"
                                    dense
                                ></v-checkbox>
                                <i class="caption">{{attr.description}}</i>
                            </v-col>
                        </v-row>
                    </v-tab-item>

                    <v-tab-item>
                        <ul>
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
                        <ul>
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

                    <v-tab-item>
                        <a target="_empty" :href="docs.docUrl">Info</a>
                    </v-tab-item>
                </v-tabs>
            </v-container>
        </v-navigation-drawer>
        <elementContainer @setSelected="setSelected" :selected="selected" :element="elements"></elementContainer>

        <!-- {{elements}} -->
    </v-container>
</template>

<script>
import vueTags from "vuetify/dist/json/tags.json";
import webtypes from "vuetify/dist/json/web-types.json";

let tags = {};
webtypes.contributions.html.tags.forEach((tag) => {
    tags[tag.name] = tag;
});

import elementContainer from "@/components/container.vue";
export default {
    name: "HomeView",
    components: { elementContainer },
    data() {
        return {
            tagList: Object.keys(vueTags),
            selected: null,
            docs: {},
            elements: {
                id: "0",
                type: "v-container",
                content: "EMPTY CONTAINER",
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
        addChild() {
            if (!this.selected) return;

            if (!this.selected?.children) {
                this.$set(this.selected, "children", []);
            }

            let parent = this.selected;

            let id = this.selected.id + "." + this.selected.children.length;
            let newElm = {
                id,
                type: "v-container",
                content: "Empty",
                children: [],
                parent: function () {
                    return parent;
                },
            };
            this.selected.children.push(newElm);
            this.$set(this.selected, "content", undefined);
            this.selected = newElm;
        },
        remChild() {
            if (!this.selected) return;
            if (!(this.selected.parent instanceof Function)) return;

            let parent = this.selected.parent();
            let pos = parent.children.indexOf(this.selected);
            if (pos >= 0) parent.children.splice(pos, 1);
        },
        getVal(prop) {
            let val = this.selected?.bind?.[prop];
            return val;
        },
        setVal(prop, val) {
            if (val == "false") val = false;
            if (val == "true") val = true;

            if (!this.selected?.bind) this.$set(this.selected, "bind", {});
            this.$set(this.selected.bind, prop, val === null ? false : val);

            if (val === null) delete this.selected.bind[prop];
        },
        setSelected(element) {
            this.selected = element;
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

