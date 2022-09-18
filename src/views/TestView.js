import elementContainer from "@/components/container.vue";


// function buid(elements) {
//     return elements.map((element, ind) => {
//         if (element.if) return `<elementContainer v-if="e[${ind}].if" :element="e[${ind}]" />`
//         if (element.elseif) return `<elementContainer v-else-if="e[${ind}].elseif" :element="e[${ind}]" />`
//         if (element.else) return `<elementContainer v-else :element="e[${ind}]" />`
//     });
// }


export default {
    components: { elementContainer },
    template: `
        <span>
            <v-row> </v-row>
            <v-btn @click="count++">
                You clicked me {{ count }} times.
            </v-btn>
      </span>`,

    data() {
        return {
            count: 0,
            elements: [
                { type: 'v-col', content: "r1", bind: {}, on: {}, children: [] },
                { type: 'v-col', content: "r2", bind: {}, on: {}, children: [] },
                { type: 'v-col', content: "r3", bind: {}, on: {}, children: [] },
                { type: 'v-col', content: "r4", bind: {}, on: {}, children: [] }
            ]
        }
    }
}
