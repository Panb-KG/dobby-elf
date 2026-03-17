module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs) <export default as minpath>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "minpath",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
}),
"[externals]/node:process [external] (node:process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}),
"[externals]/node:process [external] (node:process, cjs) <export default as minproc>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "minproc",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:process [external] (node:process, cjs)");
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs) <export fileURLToPath as urlToPath>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "urlToPath",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["fileURLToPath"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
}),
"[project]/TRAE/dobby-elf/app/services/magicElf.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Dobby Magic Service for DashScope
__turbopack_context__.s([
    "DobbyService",
    ()=>DobbyService,
    "dobby",
    ()=>dobby
]);
class DobbyService {
    async generateMagicImage(prompt) {
        try {
            const response = await fetch('/api/image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt
                })
            });
            if (!response.ok) throw new Error('Image generation failed');
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error("Image generation failed:", error);
            return null;
        }
    }
    async *chatStream(messages) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages.map((m)=>({
                            role: m.role,
                            content: m.text
                        })),
                    systemInstruction: `你是一个名叫“多比”的学习助手小精灵。你生活在“魔法小课桌”里。
你的性格：活泼、好奇、乐于助人、充满魔力感。
你的任务：
1. 帮助学生解答各种学科问题（数学、语文、英语、科学等）。
2. 用魔法比喻来解释复杂的概念，让学习变得有趣。
3. 鼓励学生，给他们加油打气。
4. 语言风格：亲切，偶尔使用一些魔法词汇（如：呼啦啦、变！、魔法能量）。
5. 保持简洁明了，但也要有温度。
6. 如果学生问你非学习相关的问题，你可以礼貌地引导回学习话题，或者用魔法的方式幽默回应。
7. 你可以接收并分析学生上传的图片、文档或视频，并根据内容提供学习建议。
8. 你拥有“自动排课”的能力。当用户说“下周二下午三点我要去练琴”之类的话时，你应该调用 addCourse 工具来帮他记录。
9. 你拥有“魔法绘图”的能力。当用户提到抽象概念（如黑洞、原子、恐龙等）或明确要求你画图时，请在回复中包含类似 [GENERATE_IMAGE: 描述内容] 的标记，多比的魔法系统会自动为你生成图片。
10. 你拥有“互动教学”的能力。你可以调用 generateExercises 工具为学生生成动态练习题。
11. 你拥有“知识追踪”的能力。当学生掌握了新知识或表现出对某个知识点的生疏时，请调用 updateKnowledgeGraph 工具更新他的知识图谱。
12. 当学生上传作业照片时，请仔细分析图片内容，指出错误并给出魔法解析。如果需要，可以调用 generateMagicImage 来画图辅助讲解。
13. 记录成功后，用你活泼的语气告诉用户你已经帮他安排好了。`,
                    tools: [
                        {
                            type: 'function',
                            function: {
                                name: 'addCourse',
                                description: '将新课程添加到学生的课程表中。只有当用户明确要求安排或添加课程时才调用此函数。',
                                parameters: {
                                    type: 'object',
                                    properties: {
                                        day: {
                                            type: 'string',
                                            enum: [
                                                "周一",
                                                "周二",
                                                "周三",
                                                "周四",
                                                "周五",
                                                "周六",
                                                "周日"
                                            ]
                                        },
                                        subject: {
                                            type: 'string'
                                        },
                                        time: {
                                            type: 'string'
                                        },
                                        type: {
                                            type: 'string',
                                            enum: [
                                                "校内",
                                                "课外"
                                            ]
                                        }
                                    },
                                    required: [
                                        "day",
                                        "subject",
                                        "time"
                                    ]
                                }
                            }
                        },
                        {
                            type: 'function',
                            function: {
                                name: 'generateExercises',
                                description: '根据学生的年级和学科生成互动练习题。',
                                parameters: {
                                    type: 'object',
                                    properties: {
                                        subject: {
                                            type: 'string'
                                        },
                                        grade: {
                                            type: 'string'
                                        },
                                        topic: {
                                            type: 'string'
                                        },
                                        questions: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: {
                                                        type: 'string'
                                                    },
                                                    question: {
                                                        type: 'string'
                                                    },
                                                    options: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string'
                                                        }
                                                    },
                                                    answer: {
                                                        type: 'string'
                                                    },
                                                    explanation: {
                                                        type: 'string'
                                                    }
                                                },
                                                required: [
                                                    "id",
                                                    "question",
                                                    "options",
                                                    "answer",
                                                    "explanation"
                                                ]
                                            }
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "grade",
                                        "questions"
                                    ]
                                }
                            }
                        },
                        {
                            type: 'function',
                            function: {
                                name: 'updateKnowledgeGraph',
                                description: '更新学生的知识图谱，记录掌握情况。',
                                parameters: {
                                    type: 'object',
                                    properties: {
                                        points: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: {
                                                        type: 'string'
                                                    },
                                                    status: {
                                                        type: 'string',
                                                        enum: [
                                                            "mastered",
                                                            "learning"
                                                        ]
                                                    },
                                                    subject: {
                                                        type: 'string'
                                                    }
                                                },
                                                required: [
                                                    "name",
                                                    "status",
                                                    "subject"
                                                ]
                                            }
                                        }
                                    },
                                    required: [
                                        "points"
                                    ]
                                }
                            }
                        }
                    ]
                })
            });
            if (!response.ok) throw new Error('Chat failed');
            const reader = response.body?.getReader();
            if (!reader) return;
            const decoder = new TextDecoder();
            let buffer = '';
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines){
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        if (data.toolCalls) {
                            yield {
                                functionCalls: data.toolCalls.map((tc)=>({
                                        name: tc.function.name,
                                        args: JSON.parse(tc.function.arguments)
                                    }))
                            };
                        }
                        if (data.text) {
                            yield data.text;
                        }
                    } catch (e) {
                        console.error('Error parsing line:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Chat stream error:', error);
            yield '哎呀，多比的魔法出了一点小状况... 请稍后再试。🪄';
        }
    }
}
const dobby = new DobbyService();
}),
"[project]/TRAE/dobby-elf/app/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DobbyAvatar",
    ()=>DobbyAvatar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
;
;
const DobbyAvatar = ({ size = "md" })=>{
    const sizes = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-20 h-20"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
        className: `${sizes[size]} relative flex items-center justify-center`,
        animate: {
            y: [
                0,
                -4,
                0
            ]
        },
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-magic-accent/20 blur-xl rounded-full animate-pulse"
            }, void 0, false, {
                fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                viewBox: "0 0 100 100",
                className: "w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].path, {
                        d: "M20 45 Q10 30 25 35",
                        fill: "none",
                        stroke: "#10b981",
                        strokeWidth: "4",
                        strokeLinecap: "round",
                        animate: {
                            rotate: [
                                -5,
                                5,
                                -5
                            ]
                        },
                        transition: {
                            duration: 2,
                            repeat: Infinity
                        }
                    }, void 0, false, {
                        fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].path, {
                        d: "M80 45 Q90 30 75 35",
                        fill: "none",
                        stroke: "#10b981",
                        strokeWidth: "4",
                        strokeLinecap: "round",
                        animate: {
                            rotate: [
                                5,
                                -5,
                                5
                            ]
                        },
                        transition: {
                            duration: 2,
                            repeat: Infinity
                        }
                    }, void 0, false, {
                        fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: "50",
                        cy: "55",
                        r: "35",
                        fill: "#064e3b",
                        stroke: "#10b981",
                        strokeWidth: "2"
                    }, void 0, false, {
                        fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].circle, {
                                cx: "35",
                                cy: "50",
                                r: "5",
                                fill: "#10b981",
                                animate: {
                                    scaleY: [
                                        1,
                                        0.1,
                                        1
                                    ]
                                },
                                transition: {
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].circle, {
                                cx: "65",
                                cy: "50",
                                r: "5",
                                fill: "#10b981",
                                animate: {
                                    scaleY: [
                                        1,
                                        0.1,
                                        1
                                    ]
                                },
                                transition: {
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].path, {
                        d: "M40 70 Q50 78 60 70",
                        fill: "none",
                        stroke: "#10b981",
                        strokeWidth: "3",
                        strokeLinecap: "round",
                        animate: {
                            d: [
                                "M40 70 Q50 78 60 70",
                                "M42 72 Q50 75 58 72",
                                "M40 70 Q50 78 60 70"
                            ]
                        },
                        transition: {
                            duration: 4,
                            repeat: Infinity
                        }
                    }, void 0, false, {
                        fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].circle, {
                        cx: "20",
                        cy: "20",
                        r: "2",
                        fill: "#fbbf24",
                        animate: {
                            opacity: [
                                0,
                                1,
                                0
                            ],
                            scale: [
                                0.5,
                                1.2,
                                0.5
                            ]
                        },
                        transition: {
                            duration: 1.5,
                            repeat: Infinity
                        }
                    }, void 0, false, {
                        fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].circle, {
                        cx: "85",
                        cy: "75",
                        r: "1.5",
                        fill: "#fbbf24",
                        animate: {
                            opacity: [
                                0,
                                1,
                                0
                            ],
                            scale: [
                                0.5,
                                1.5,
                                0.5
                            ]
                        },
                        transition: {
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.5
                        }
                    }, void 0, false, {
                        fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/TRAE/dobby-elf/firebase-applet-config.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"projectId":"gen-lang-client-0780852986","appId":"1:345036445245:web:b5d7e4777b2e90863c3c54","apiKey":"AIzaSyAg8fN5dryTKFhZc72pmPaBQ3eLy1UnyV4","authDomain":"gen-lang-client-0780852986.firebaseapp.com","firestoreDatabaseId":"ai-studio-d29da025-c666-439c-ba55-97fab8f0d150","storageBucket":"gen-lang-client-0780852986.firebasestorage.app","messagingSenderId":"345036445245","measurementId":""});}),
"[project]/TRAE/dobby-elf/app/firebase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OperationType",
    ()=>OperationType,
    "auth",
    ()=>auth,
    "db",
    ()=>db,
    "googleProvider",
    ()=>googleProvider,
    "handleFirestoreError",
    ()=>handleFirestoreError,
    "loginWithGoogle",
    ()=>loginWithGoogle,
    "logout",
    ()=>logout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/firebase/app/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/@firebase/app/dist/esm/index.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$firebase$2d$applet$2d$config$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/firebase-applet-config.json (json)");
;
;
;
;
// Initialize Firebase
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeApp"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$firebase$2d$applet$2d$config$2e$json__$28$json$29$__["default"]);
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirestore"])(app, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$firebase$2d$applet$2d$config$2e$json__$28$json$29$__["default"].firestoreDatabaseId);
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuth"])(app);
const googleProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleAuthProvider"]();
const loginWithGoogle = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signInWithPopup"])(auth, googleProvider);
const logout = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])(auth);
var OperationType = /*#__PURE__*/ function(OperationType) {
    OperationType["CREATE"] = "create";
    OperationType["UPDATE"] = "update";
    OperationType["DELETE"] = "delete";
    OperationType["LIST"] = "list";
    OperationType["GET"] = "get";
    OperationType["WRITE"] = "write";
    return OperationType;
}({});
function handleFirestoreError(error, operationType, path) {
    const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            emailVerified: auth.currentUser?.emailVerified,
            isAnonymous: auth.currentUser?.isAnonymous,
            tenantId: auth.currentUser?.tenantId,
            providerInfo: auth.currentUser?.providerData.map((provider)=>({
                    providerId: provider.providerId,
                    displayName: provider.displayName,
                    email: provider.email,
                    photoUrl: provider.photoURL
                })) || []
        },
        operationType,
        path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
}
// Connection Test
async function testConnection() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocFromServer"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(db, 'test', 'connection'));
    } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration. The client appears to be offline.");
        }
    }
}
testConnection();
}),
"[project]/TRAE/dobby-elf/app/MagicApp.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>App
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/book-open.js [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/wand-sparkles.js [app-ssr] (ecmascript) <export default as Wand2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/history.js [app-ssr] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2d$circuit$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BrainCircuit$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/brain-circuit.js [app-ssr] (ecmascript) <export default as BrainCircuit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/languages.js [app-ssr] (ecmascript) <export default as Languages>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hourglass$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hourglass$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/hourglass.js [app-ssr] (ecmascript) <export default as Hourglass>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/pencil.js [app-ssr] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/panel-right-close.js [app-ssr] (ecmascript) <export default as PanelRightClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/panel-right-open.js [app-ssr] (ecmascript) <export default as PanelRightOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/panels-top-left.js [app-ssr] (ecmascript) <export default as Layout>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$medal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Medal$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/medal.js [app-ssr] (ecmascript) <export default as Medal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/star.js [app-ssr] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/award.js [app-ssr] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paperclip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paperclip$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/paperclip.js [app-ssr] (ecmascript) <export default as Paperclip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/mic.js [app-ssr] (ecmascript) <export default as Mic>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/file.js [app-ssr] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/video.js [app-ssr] (ecmascript) <export default as Video>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/log-in.js [app-ssr] (ecmascript) <export default as LogIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/droplets.js [app-ssr] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$leaf$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Leaf$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/leaf.js [app-ssr] (ecmascript) <export default as Leaf>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-ssr] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/circle.js [app-ssr] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/volume-x.js [app-ssr] (ecmascript) <export default as VolumeX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$library$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Library$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/library.js [app-ssr] (ecmascript) <export default as Library>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/cloud-rain.js [app-ssr] (ecmascript) <export default as CloudRain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/lucide-react/dist/esm/icons/flame.js [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/react-markdown/lib/index.js [app-ssr] (ecmascript) <export Markdown as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$services$2f$magicElf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/app/services/magicElf.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/app/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$components$2f$DobbyAvatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/app/components/DobbyAvatar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/app/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/TRAE/dobby-elf/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
// Error Boundary Component
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Component"] {
    constructor(props){
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-screen w-full flex items-center justify-center bg-[#0a0502] p-6 text-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "glass-panel p-8 max-w-md space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                            className: "w-12 h-12 text-red-500 mx-auto"
                        }, void 0, false, {
                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                            lineNumber: 102,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-serif font-bold text-white",
                            children: "魔法出错了"
                        }, void 0, false, {
                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                            lineNumber: 103,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-white/60 leading-relaxed",
                            children: "哎呀，多比的魔法好像出了点小问题。别担心，你可以尝试刷新页面或者稍后再试。"
                        }, void 0, false, {
                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                            lineNumber: 104,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono text-white/40 text-left overflow-auto max-h-32",
                            children: this.state.error?.message || String(this.state.error)
                        }, void 0, false, {
                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                            lineNumber: 107,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>window.location.reload(),
                            className: "w-full py-3 bg-magic-accent text-white rounded-xl font-bold",
                            children: "重试魔法"
                        }, void 0, false, {
                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                            lineNumber: 110,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                    lineNumber: 101,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                lineNumber: 100,
                columnNumber: 9
            }, this);
        }
        return this.props.children;
    }
}
const SPELLS = [
    {
        id: 'schedule',
        name: '课程表',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
        prompt: '多比，帮我看看我的课程安排，或者帮我制定一个学习计划吧！'
    },
    {
        id: 'homework',
        name: '批改作业',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"],
        prompt: '多比，这是我的作业照片，请帮我批改一下：'
    },
    {
        id: 'words',
        name: '学单词',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__["Languages"],
        prompt: '多比，我想学习一些新单词，或者帮我翻译一下：'
    },
    {
        id: 'math',
        name: '互动练习',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2d$circuit$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BrainCircuit$3e$__["BrainCircuit"],
        prompt: '多比，我想练习一下最近学的知识点，帮我出几道题吧！'
    },
    {
        id: 'focus',
        name: '魔法专注',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hourglass$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hourglass$3e$__["Hourglass"],
        prompt: '多比，我想开始一段专注学习，帮我开启魔法沙漏吧！'
    },
    {
        id: 'achievements',
        name: '成就墙',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"],
        prompt: '多比，快来看看我的成就墙，帮我记录一下新的荣誉，或者看看我攒了多少积分啦！'
    }
];
function App() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorBoundary, {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MagicApp, {}, void 0, false, {
            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
            lineNumber: 136,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, this);
}
function MagicApp() {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isAuthReady, setIsAuthReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            role: 'model',
            text: '呼啦啦！你好呀，小主人！我是你的学习小魔灵多比。今天有什么想探索的知识魔法吗？✨'
        }
    ]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('chat');
    const [isRightSidebarOpen, setIsRightSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sidebarContentType, setSidebarContentType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('none');
    const [scheduleView, setScheduleView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('week');
    const [selectedDay, setSelectedDay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('周一');
    const [isAddingCourse, setIsAddingCourse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newCourse, setNewCourse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        day: '周一',
        subject: '',
        time: '',
        type: '校内'
    });
    const [courses, setCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            day: '周一',
            subject: '魔法数学',
            time: '09:00 - 10:30',
            type: '校内',
            color: 'bg-blue-500/20 border-blue-500/30'
        },
        {
            day: '周一',
            subject: '飞行课',
            time: '11:00 - 12:00',
            type: '校内',
            color: 'bg-sky-500/20 border-sky-500/30'
        },
        {
            day: '周二',
            subject: '咒语文学',
            time: '10:45 - 12:15',
            type: '校内',
            color: 'bg-purple-500/20 border-purple-500/30'
        },
        {
            day: '周二',
            subject: '神奇动物学',
            time: '14:00 - 15:30',
            type: '校内',
            color: 'bg-orange-500/20 border-orange-500/30'
        },
        {
            day: '周三',
            subject: '星象科学',
            time: '14:00 - 15:30',
            type: '校内',
            color: 'bg-amber-500/20 border-amber-500/30'
        },
        {
            day: '周三',
            subject: '魔药学',
            time: '16:00 - 17:30',
            type: '校内',
            color: 'bg-green-500/20 border-green-500/30'
        },
        {
            day: '周四',
            subject: '药草英语',
            time: '09:00 - 10:30',
            type: '校内',
            color: 'bg-emerald-500/20 border-emerald-500/30'
        },
        {
            day: '周四',
            subject: '黑魔法防御术',
            time: '13:00 - 14:30',
            type: '校内',
            color: 'bg-slate-500/20 border-slate-500/30'
        },
        {
            day: '周五',
            subject: '奥数竞技',
            time: '15:45 - 17:15',
            type: '课外',
            color: 'bg-rose-500/20 border-rose-500/30'
        },
        {
            day: '周五',
            subject: '魔法史',
            time: '10:00 - 11:30',
            type: '校内',
            color: 'bg-yellow-500/20 border-yellow-500/30'
        },
        {
            day: '周六',
            subject: '魁地奇训练',
            time: '09:00 - 11:00',
            type: '课外',
            color: 'bg-red-500/20 border-red-500/30'
        },
        {
            day: '周六',
            subject: '钢琴魔法',
            time: '14:00 - 15:30',
            type: '课外',
            color: 'bg-indigo-500/20 border-indigo-500/30'
        },
        {
            day: '周日',
            subject: '幻影显形模拟',
            time: '10:00 - 11:30',
            type: '课外',
            color: 'bg-cyan-500/20 border-cyan-500/30'
        },
        {
            day: '周日',
            subject: '自由魔法实验',
            time: '15:00 - 17:00',
            type: '课外',
            color: 'bg-lime-500/20 border-lime-500/30'
        }
    ]);
    const [points, setPoints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1250);
    const [level, setLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('魔法学徒');
    const [treeGrowth, setTreeGrowth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [dailyTasks, setDailyTasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 'task1',
            text: '完成3道奥数题',
            completed: false,
            reward: 50
        },
        {
            id: 'task2',
            text: '背诵5个新单词',
            completed: false,
            reward: 30
        },
        {
            id: 'task3',
            text: '查看今日课程表',
            completed: false,
            reward: 10
        }
    ]);
    const [achievements, setAchievements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 1,
            title: '三好学生',
            date: '2025-12',
            type: 'school',
            iconName: 'Award',
            color: 'text-amber-400'
        },
        {
            id: 2,
            title: '奥数竞赛一等奖',
            date: '2026-01',
            type: 'competition',
            iconName: 'Trophy',
            color: 'text-yellow-500'
        },
        {
            id: 3,
            title: '单词达人',
            date: '2026-02',
            type: 'learning',
            iconName: 'Star',
            color: 'text-blue-400'
        }
    ]);
    const [activeReminder, setActiveReminder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Magic Teaching States
    const [knowledgeGraph, setKnowledgeGraph] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            name: '分数乘法',
            status: 'mastered',
            subject: '数学'
        },
        {
            name: '过去进行时',
            status: 'learning',
            subject: '英语'
        },
        {
            name: '古诗词鉴赏',
            status: 'learning',
            subject: '语文'
        }
    ]);
    const [dynamicExercises, setDynamicExercises] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [exerciseAnswers, setExerciseAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [showExerciseResult, setShowExerciseResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Focus Tool States
    const [focusTime, setFocusTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(25 * 60);
    const [isFocusActive, setIsFocusActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isHourglassBroken, setIsHourglassBroken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [whiteNoise, setWhiteNoise] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('none');
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auth Listener
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"], (firebaseUser)=>{
            setUser(firebaseUser);
            setIsAuthReady(true);
            if (firebaseUser) {
                setMessages((prev)=>[
                        ...prev,
                        {
                            role: 'model',
                            text: `呼啦啦！欢迎回来，${firebaseUser.displayName}！多比已经准备好为你服务了。✨`
                        }
                    ]);
            }
        });
        return ()=>unsubscribe();
    }, []);
    // Sync User Profile
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user || !isAuthReady) return;
        const userDocRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', user.uid);
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])(userDocRef, (snapshot)=>{
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.points !== undefined) setPoints(data.points);
                if (data.level !== undefined) setLevel(data.level);
                if (data.treeGrowth !== undefined) setTreeGrowth(data.treeGrowth);
                if (data.dailyTasks !== undefined) setDailyTasks(data.dailyTasks);
            } else {
                // Initialize user profile
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDoc"])(userDocRef, {
                    points: 1250,
                    level: '魔法学徒',
                    treeGrowth: 0,
                    dailyTasks: [
                        {
                            id: 'task1',
                            text: '完成3道奥数题',
                            completed: false,
                            reward: 50
                        },
                        {
                            id: 'task2',
                            text: '背诵5个新单词',
                            completed: false,
                            reward: 30
                        },
                        {
                            id: 'task3',
                            text: '查看今日课程表',
                            completed: false,
                            reward: 10
                        }
                    ],
                    displayName: user.displayName,
                    email: user.email,
                    role: 'client'
                }).catch((err)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].WRITE, `users/${user.uid}`));
            }
        }, (err)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].GET, `users/${user.uid}`));
        return ()=>unsubscribe();
    }, [
        user,
        isAuthReady
    ]);
    // Sync Courses
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user || !isAuthReady) return;
        const coursesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', user.uid, 'courses');
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])(coursesRef, (snapshot)=>{
            const fetchedCourses = snapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
            if (fetchedCourses.length > 0) {
                setCourses(fetchedCourses);
            }
        }, (err)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].GET, `users/${user.uid}/courses`));
        return ()=>unsubscribe();
    }, [
        user,
        isAuthReady
    ]);
    // Sync Achievements
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user || !isAuthReady) return;
        const achievementsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', user.uid, 'achievements');
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSnapshot"])(achievementsRef, (snapshot)=>{
            const fetchedAchievements = snapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
            if (fetchedAchievements.length > 0) {
                setAchievements(fetchedAchievements);
            }
        }, (err)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].GET, `users/${user.uid}/achievements`));
        return ()=>unsubscribe();
    }, [
        user,
        isAuthReady
    ]);
    // Smart Reminder System
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setInterval(()=>{
            const now = new Date();
            const days = [
                '周日',
                '周一',
                '周二',
                '周三',
                '周四',
                '周五',
                '周六'
            ];
            const currentDay = days[now.getDay()];
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            courses.forEach((course)=>{
                if (course.day === currentDay) {
                    const startTime = course.time.split(' - ')[0];
                    if (!startTime) return;
                    const [h, m] = startTime.split(':').map(Number);
                    const courseDate = new Date();
                    courseDate.setHours(h, m, 0, 0);
                    const diff = (courseDate.getTime() - now.getTime()) / (1000 * 60);
                    // Trigger reminder if class starts in 1-5 minutes
                    if (diff > 0 && diff <= 5) {
                        setActiveReminder({
                            subject: course.subject,
                            time: startTime
                        });
                    }
                }
            });
        }, 60000); // Check every minute
        return ()=>clearInterval(timer);
    }, [
        courses
    ]);
    const [attachments, setAttachments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isRecording, setIsRecording] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [generatedImage, setGeneratedImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const recognitionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Focus Timer Logic
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let interval;
        if (isFocusActive && focusTime > 0) {
            interval = setInterval(()=>{
                setFocusTime((prev)=>prev - 1);
            }, 1000);
        } else if (focusTime === 0) {
            setIsFocusActive(false);
            setMessages((prev)=>[
                    ...prev,
                    {
                        role: 'model',
                        text: '呼啦啦！专注时间结束！小主人你太棒了，魔法能量充满了你的大脑！✨'
                    }
                ]);
            setPoints((prev)=>prev + 50);
        }
        return ()=>clearInterval(interval);
    }, [
        isFocusActive,
        focusTime
    ]);
    // Tab Visibility Detection (Hourglass Breaking)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleVisibilityChange = ()=>{
            if (document.hidden && isFocusActive) {
                setIsFocusActive(false);
                setIsHourglassBroken(true);
                setMessages((prev)=>[
                        ...prev,
                        {
                            role: 'model',
                            text: '哎呀！沙漏碎掉了... 专注魔法被打断了。小主人，我们要保持一心一意哦。🪄'
                        }
                    ]);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return ()=>document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [
        isFocusActive
    ]);
    // White Noise Logic
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }
        const audio = audioRef.current;
        if (whiteNoise !== 'none') {
            const urls = {
                library: 'https://www.soundjay.com/ambient/library-ambience-01.mp3',
                rain: 'https://www.soundjay.com/nature/rain-01.mp3',
                fire: 'https://www.soundjay.com/household/fireplace-01.mp3'
            };
            const targetUrl = urls[whiteNoise];
            if (audio.src !== targetUrl) {
                audio.src = targetUrl;
                audio.load();
            }
            audio.volume = 0.5;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((error)=>{
                    console.log("Playback prevented by browser:", error);
                // Auto-retry once or wait for next interaction
                });
            }
        } else {
            audio.pause();
        }
    }, [
        whiteNoise
    ]);
    // Initialize Speech Recognition
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'zh-CN';
            recognitionRef.current.onresult = (event)=>{
                const transcript = event.results[0][0].transcript;
                setInput((prev)=>prev + transcript);
                setIsRecording(false);
            };
            recognitionRef.current.onerror = (event)=>{
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
            };
            recognitionRef.current.onend = ()=>{
                setIsRecording(false);
            };
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [
        messages
    ]);
    const handleSend = async (textOverride)=>{
        const textToSend = textOverride || input;
        if (!textToSend.trim() && attachments.length === 0 || isLoading) return;
        // Convert attachments to base64
        const fileData = await Promise.all(attachments.map(async (file)=>{
            const base64 = await fileToBase64(file);
            return {
                mimeType: file.type,
                data: base64
            };
        }));
        const userMsg = {
            role: 'user',
            text: textToSend || (attachments.length > 0 ? "[发送了附件]" : ""),
            files: fileData.length > 0 ? fileData : undefined
        };
        setMessages((prev)=>[
                ...prev,
                userMsg
            ]);
        setInput('');
        setAttachments([]);
        setIsLoading(true);
        try {
            const history = [
                ...messages,
                userMsg
            ];
            let fullResponse = '';
            // Add a placeholder message for streaming
            setMessages((prev)=>[
                    ...prev,
                    {
                        role: 'model',
                        text: ''
                    }
                ]);
            const stream = __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$services$2f$magicElf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dobby"].chatStream(history);
            for await (const chunk of stream){
                if (typeof chunk === 'object' && chunk.functionCalls) {
                    for (const call of chunk.functionCalls){
                        if (call.name === 'addCourse') {
                            const args = call.args;
                            await performAddCourse(args);
                        } else if (call.name === 'generateExercises') {
                            const args = call.args;
                            setDynamicExercises(args);
                            setCurrentExerciseIndex(0);
                            setExerciseAnswers({});
                            setShowExerciseResult(false);
                            setSidebarContentType('exercise');
                            setIsRightSidebarOpen(true);
                        } else if (call.name === 'updateKnowledgeGraph') {
                            const args = call.args;
                            setKnowledgeGraph((prev)=>{
                                const newGraph = [
                                    ...prev
                                ];
                                args.points.forEach((newPoint)=>{
                                    const existingIndex = newGraph.findIndex((p)=>p.name === newPoint.name);
                                    if (existingIndex >= 0) {
                                        newGraph[existingIndex] = newPoint;
                                    } else {
                                        newGraph.push(newPoint);
                                    }
                                });
                                return newGraph;
                            });
                            setSidebarContentType('exercise');
                            setIsRightSidebarOpen(true);
                        }
                    }
                    continue;
                }
                if (typeof chunk === 'string') {
                    fullResponse += chunk;
                    // Check for image generation trigger
                    const imageMatch = fullResponse.match(/\[GENERATE_IMAGE:\s*(.*?)\]/);
                    if (imageMatch) {
                        const prompt = imageMatch[1];
                        // Remove the trigger tag from display
                        const cleanText = fullResponse.replace(/\[GENERATE_IMAGE:.*?\]/g, '');
                        setMessages((prev)=>{
                            const newMessages = [
                                ...prev
                            ];
                            newMessages[newMessages.length - 1] = {
                                role: 'model',
                                text: cleanText
                            };
                            return newMessages;
                        });
                        // Trigger image generation in background
                        __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$services$2f$magicElf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dobby"].generateMagicImage(prompt).then((url)=>{
                            if (url) {
                                setGeneratedImage(url);
                                setIsRightSidebarOpen(true);
                                setSidebarContentType('image');
                            }
                        });
                    } else {
                        setMessages((prev)=>{
                            const newMessages = [
                                ...prev
                            ];
                            newMessages[newMessages.length - 1] = {
                                role: 'model',
                                text: fullResponse
                            };
                            return newMessages;
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Magic failed:', error);
            setMessages((prev)=>{
                const newMessages = [
                    ...prev
                ];
                newMessages[newMessages.length - 1] = {
                    role: 'model',
                    text: `哎呀，魔法能量好像有点不稳定... 错误信息：${error.message || '未知魔法干扰'}`
                };
                return newMessages;
            });
        } finally{
            setIsLoading(false);
            setAttachments([]);
        }
    };
    const handleFileChange = (e)=>{
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachments((prev)=>[
                    ...prev,
                    ...newFiles
                ]);
        }
    };
    const removeAttachment = (index)=>{
        setAttachments((prev)=>prev.filter((_, i)=>i !== index));
    };
    const toggleRecording = ()=>{
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            if (recognitionRef.current) {
                setIsRecording(true);
                recognitionRef.current.start();
            } else {
                alert("哎呀，你的浏览器好像不支持魔法语音，换个现代点的浏览器试试吧！");
            }
        }
    };
    const fileToBase64 = (file)=>{
        return new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = ()=>{
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error)=>reject(error);
        });
    };
    const handleAddCourse = async ()=>{
        if (!newCourse.subject || !newCourse.time) return;
        await performAddCourse(newCourse);
        setIsAddingCourse(false);
        setNewCourse({
            day: '周一',
            subject: '',
            time: '',
            type: '校内'
        });
    };
    const performAddCourse = async (courseData)=>{
        // ... existing colors ...
        const colors = [
            'bg-blue-500/20 border-blue-500/30',
            'bg-purple-500/20 border-purple-500/30',
            'bg-amber-500/20 border-amber-500/30',
            'bg-emerald-500/20 border-emerald-500/30',
            'bg-rose-500/20 border-rose-500/30',
            'bg-sky-500/20 border-sky-500/30',
            'bg-indigo-500/20 border-indigo-500/30'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const finalCourse = {
            type: '课外',
            color: randomColor,
            ...courseData
        };
        if (user) {
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', user.uid, 'courses'), {
                    ...finalCourse,
                    uid: user.uid
                });
                // Complete "View Schedule" task if adding a course
                completeTask('task3');
            } catch (err) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].CREATE, `users/${user.uid}/courses`);
            }
        } else {
            setCourses((prev)=>[
                    ...prev,
                    finalCourse
                ]);
        }
    };
    const completeTask = async (taskId)=>{
        if (!user) return;
        const task = dailyTasks.find((t)=>t.id === taskId);
        if (!task || task.completed) return;
        const newTasks = dailyTasks.map((t)=>t.id === taskId ? {
                ...t,
                completed: true
            } : t);
        const newPoints = points + task.reward;
        // Calculate new level
        let newLevel = level;
        if (newPoints >= 5000) newLevel = '大魔法师';
        else if (newPoints >= 3000) newLevel = '高级魔法师';
        else if (newPoints >= 2000) newLevel = '中级魔法师';
        else if (newPoints >= 1000) newLevel = '初级魔法师';
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', user.uid), {
                dailyTasks: newTasks,
                points: newPoints,
                level: newLevel
            });
            // Celebration effect (simulated by message)
            setMessages((prev)=>[
                    ...prev,
                    {
                        role: 'model',
                        text: `🎉 呼啦啦！恭喜小主人完成了任务：**${task.text}**！获得了 **${task.reward}** 魔法积分！变！✨`
                    }
                ]);
        } catch (err) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `users/${user.uid}`);
        }
    };
    const waterTree = async ()=>{
        if (!user || points < 50) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], 'users', user.uid), {
                points: points - 50,
                treeGrowth: treeGrowth + 1
            });
            setMessages((prev)=>[
                    ...prev,
                    {
                        role: 'model',
                        text: `💧 你用 50 积分灌溉了“知识之树”，它又长大了一点点！瞧，它的叶子更绿了。🌿`
                    }
                ]);
        } catch (err) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleFirestoreError"])(err, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperationType"].UPDATE, `users/${user.uid}`);
        }
    };
    const useSpell = (spell)=>{
        setInput(spell.prompt);
        // Automatically open sidebar and set content based on spell
        if (spell.id === 'schedule') {
            setIsRightSidebarOpen(true);
            setSidebarContentType('schedule');
        } else if (spell.id === 'homework' || spell.id === 'math') {
            setIsRightSidebarOpen(true);
            setSidebarContentType('exercise');
        } else if (spell.id === 'achievements') {
            setIsRightSidebarOpen(true);
            setSidebarContentType('achievements');
        } else if (spell.id === 'focus') {
            setIsRightSidebarOpen(true);
            setSidebarContentType('focus');
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-screen w-full flex flex-col overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "atmosphere"
            }, void 0, false, {
                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                lineNumber: 668,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: activeReminder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: -50,
                        x: '-50%'
                    },
                    animate: {
                        opacity: 1,
                        y: 20,
                        x: '-50%'
                    },
                    exit: {
                        opacity: 0,
                        y: -50,
                        x: '-50%'
                    },
                    className: "fixed top-0 left-1/2 z-[100] w-[90%] max-w-md",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 rounded-2xl bg-magic-accent border border-white/20 shadow-2xl shadow-magic-accent/40 flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center animate-bounce",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                    className: "w-6 h-6 text-white"
                                }, void 0, false, {
                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                    lineNumber: 681,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 680,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-white font-bold text-sm",
                                        children: "魔法提醒！✨"
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 684,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-white/80 text-xs",
                                        children: [
                                            "小主人，你的“",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold",
                                                children: activeReminder.subject
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 686,
                                                columnNumber: 26
                                            }, this),
                                            "”课程将在 ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold",
                                                children: activeReminder.time
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 686,
                                                columnNumber: 91
                                            }, this),
                                            " 开始。快准备好你的魔法棒吧！"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 685,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 683,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveReminder(null),
                                className: "p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                    lineNumber: 693,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 689,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                        lineNumber: 679,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                    lineNumber: 673,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                lineNumber: 671,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center justify-between px-6 py-4 z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$components$2f$DobbyAvatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DobbyAvatar"], {
                                size: "md"
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 703,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl font-serif font-bold tracking-wide text-white",
                                        children: "魔法小课桌"
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 705,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] uppercase tracking-[0.2em] text-magic-accent font-bold",
                                            children: "Dobby's Magic Desk"
                                        }, void 0, false, {
                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                            lineNumber: 707,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 706,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 704,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                        lineNumber: 702,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsRightSidebarOpen(!isRightSidebarOpen),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-2 rounded-full transition-all", isRightSidebarOpen ? "bg-magic-accent/20 text-magic-accent" : "hover:bg-white/5 text-white/60"),
                                title: isRightSidebarOpen ? "关闭展示栏" : "打开展示栏",
                                children: isRightSidebarOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__["PanelRightClose"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                    lineNumber: 720,
                                    columnNumber: 35
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__["PanelRightOpen"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                    lineNumber: 720,
                                    columnNumber: 77
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 712,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "p-2 rounded-full hover:bg-white/5 transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                    className: "w-5 h-5 text-white/60"
                                }, void 0, false, {
                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                    lineNumber: 723,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 722,
                                columnNumber: 11
                            }, this),
                            user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-end hidden sm:flex",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-medium text-white",
                                                children: user.displayName
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 728,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] text-white/40 uppercase tracking-widest",
                                                children: "魔法师"
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 729,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 727,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logout"],
                                        className: "p-2 rounded-full hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all",
                                        title: "登出魔法世界",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                            lineNumber: 736,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 731,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 726,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loginWithGoogle"],
                                className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-magic-accent text-white text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-magic-accent/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 744,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "魔法登录"
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 745,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 740,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                        lineNumber: 711,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                lineNumber: 701,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "hidden md:flex flex-col gap-4 w-64",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "glass-panel p-6 flex-1 flex flex-col gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-serif italic text-white/60 border-b border-white/10 pb-2",
                                    children: "魔法咒语库"
                                }, void 0, false, {
                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                    lineNumber: 756,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: SPELLS.map((spell)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>useSpell(spell),
                                            className: "w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group text-left",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-2 rounded-xl bg-white/5 group-hover:bg-magic-accent/20 transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(spell.icon, {
                                                        className: "w-4 h-4 text-white/70 group-hover:text-magic-accent"
                                                    }, void 0, false, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 765,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                    lineNumber: 764,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium text-white/80",
                                                    children: spell.name
                                                }, void 0, false, {
                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                    lineNumber: 767,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                    className: "w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                                }, void 0, false, {
                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                    lineNumber: 768,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, spell.id, true, {
                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                            lineNumber: 759,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                    lineNumber: 757,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-auto p-4 rounded-2xl bg-gradient-to-br from-magic-accent/10 to-transparent border border-magic-accent/20",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-white/60 leading-relaxed italic",
                                        children: '"知识是唯一的魔法，而你是那个伟大的魔法师。"'
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 774,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                    lineNumber: 773,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                            lineNumber: 755,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                        lineNumber: 754,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "flex-1 flex flex-col glass-panel overflow-hidden relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: scrollRef,
                                className: "flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth",
                                style: {
                                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                        initial: false,
                                        children: messages.map((msg, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                initial: {
                                                    opacity: 0,
                                                    y: 20,
                                                    scale: 0.95
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1
                                                },
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col max-w-[85%] md:max-w-[75%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-5 py-3 rounded-3xl text-sm md:text-base leading-relaxed", msg.role === 'user' ? "bg-magic-accent/20 border border-magic-accent/30 text-white rounded-tr-none" : "bg-white/5 border border-white/10 text-stone-200 rounded-tl-none"),
                                                        children: [
                                                            msg.files && msg.files.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-wrap gap-2 mb-3",
                                                                children: msg.files.map((file, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5",
                                                                        children: [
                                                                            file.mimeType.startsWith('image/') ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                                                                className: "w-4 h-4 text-emerald-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 811,
                                                                                columnNumber: 31
                                                                            }, this) : file.mimeType.startsWith('video/') ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__["Video"], {
                                                                                className: "w-4 h-4 text-blue-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 813,
                                                                                columnNumber: 31
                                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"], {
                                                                                className: "w-4 h-4 text-amber-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 815,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-[10px] text-white/40 uppercase tracking-tighter",
                                                                                children: [
                                                                                    "附件 ",
                                                                                    idx + 1
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 817,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, idx, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 809,
                                                                        columnNumber: 27
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 807,
                                                                columnNumber: 23
                                                            }, this),
                                                            msg.role === 'model' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "markdown-body",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__["default"], {
                                                                    children: msg.text
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 824,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 823,
                                                                columnNumber: 23
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                children: msg.text
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 827,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 800,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-2 mt-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row"),
                                                        children: [
                                                            msg.role === 'model' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$components$2f$DobbyAvatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DobbyAvatar"], {
                                                                size: "sm"
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 834,
                                                                columnNumber: 46
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] text-white/30 uppercase tracking-widest font-bold",
                                                                children: msg.role === 'user' ? 'Seeker' : 'Dobby'
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 835,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 830,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, i, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 791,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 789,
                                        columnNumber: 13
                                    }, this),
                                    isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0
                                        },
                                        animate: {
                                            opacity: 1
                                        },
                                        className: "flex items-center gap-3 text-magic-accent/60",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$components$2f$DobbyAvatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DobbyAvatar"], {
                                                size: "sm"
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 848,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs italic font-serif",
                                                children: "正在施展魔法..."
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 849,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 843,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 784,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 md:p-6 border-t border-white/5 bg-black/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                        children: attachments.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                y: 10
                                            },
                                            animate: {
                                                opacity: 1,
                                                y: 0
                                            },
                                            exit: {
                                                opacity: 0,
                                                y: 10
                                            },
                                            className: "flex flex-wrap gap-2 mb-4",
                                            children: attachments.map((file, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative group p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2",
                                                    children: [
                                                        file.type.startsWith('image/') ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                                            className: "w-4 h-4 text-emerald-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                            lineNumber: 868,
                                                            columnNumber: 25
                                                        }, this) : file.type.startsWith('video/') ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__["Video"], {
                                                            className: "w-4 h-4 text-blue-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                            lineNumber: 870,
                                                            columnNumber: 25
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"], {
                                                            className: "w-4 h-4 text-amber-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                            lineNumber: 872,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] text-white/60 max-w-[80px] truncate",
                                                            children: file.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                            lineNumber: 874,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>removeAttachment(idx),
                                                            className: "p-1 rounded-full bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 879,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                            lineNumber: 875,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, idx, true, {
                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                    lineNumber: 866,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                            lineNumber: 859,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 857,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex md:hidden gap-2 overflow-x-auto pb-4 no-scrollbar",
                                        children: SPELLS.map((spell)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>useSpell(spell),
                                                className: "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(spell.icon, {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 895,
                                                        columnNumber: 19
                                                    }, this),
                                                    spell.name
                                                ]
                                            }, spell.id, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 890,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 888,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative group flex items-end gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        value: input,
                                                        onChange: (e)=>setInput(e.target.value),
                                                        onKeyDown: (e)=>{
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleSend();
                                                            }
                                                        },
                                                        placeholder: isRecording ? "正在倾听魔法的声音..." : "输入你的问题，让魔法发生...",
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl px-6 py-4 pr-24 text-sm md:text-base focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all resize-none h-14 md:h-16 flex items-center", isRecording && "border-magic-accent/50 bg-magic-accent/5 ring-2 ring-magic-accent/20")
                                                    }, void 0, false, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 903,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "file",
                                                                ref: fileInputRef,
                                                                onChange: handleFileChange,
                                                                className: "hidden",
                                                                multiple: true
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 919,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>fileInputRef.current?.click(),
                                                                className: "p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors",
                                                                title: "上传附件",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paperclip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paperclip$3e$__["Paperclip"], {
                                                                    className: "w-5 h-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 931,
                                                                    columnNumber: 21
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 926,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: toggleRecording,
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-2 rounded-lg transition-all", isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-white/10 text-white/40 hover:text-white"),
                                                                title: isRecording ? "停止录音" : "语音输入",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                                                    className: "w-5 h-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 941,
                                                                    columnNumber: 21
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 933,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 918,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 902,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleSend(),
                                                disabled: !input.trim() && attachments.length === 0 || isLoading,
                                                className: "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-magic-accent flex items-center justify-center text-white shadow-lg shadow-magic-accent/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                    lineNumber: 950,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 945,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 901,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 855,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                        lineNumber: 782,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: isRightSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].aside, {
                            initial: {
                                width: 0,
                                opacity: 0,
                                x: 20
                            },
                            animate: {
                                width: '28rem',
                                opacity: 1,
                                x: 0
                            },
                            exit: {
                                width: 0,
                                opacity: 0,
                                x: 20
                            },
                            transition: {
                                type: 'spring',
                                damping: 25,
                                stiffness: 200
                            },
                            className: "hidden lg:flex flex-col glass-panel overflow-hidden",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6 flex flex-col h-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__["Layout"], {
                                                        className: "w-4 h-4 text-magic-accent"
                                                    }, void 0, false, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 969,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-sm font-serif italic text-white/80",
                                                        children: "魔法展示窗"
                                                    }, void 0, false, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 970,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 968,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setIsRightSidebarOpen(false),
                                                className: "p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                    lineNumber: 976,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 972,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 967,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 overflow-y-auto pr-2 custom-scrollbar",
                                        children: [
                                            sidebarContentType === 'none' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-full flex flex-col items-center justify-center text-center p-8 opacity-40",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                            className: "w-8 h-8"
                                                        }, void 0, false, {
                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                            lineNumber: 984,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 983,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-serif italic",
                                                        children: [
                                                            "等待多比为你展示魔法内容...",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 987,
                                                                columnNumber: 40
                                                            }, this),
                                                            "你可以试着点击左侧的“课程表”或“作业”。"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 986,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 982,
                                                columnNumber: 21
                                            }, this),
                                            sidebarContentType === 'schedule' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "sticky top-0 z-20 pt-1 pb-4 space-y-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20 flex items-center justify-between backdrop-blur-xl shadow-lg shadow-black/5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                className: "text-lg font-serif font-bold text-white mb-1",
                                                                                children: "我的魔法课程表"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 999,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-xs text-white/40",
                                                                                children: "2026年3月 · 第一周"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1000,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 998,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                onClick: ()=>setIsAddingCourse(!isAddingCourse),
                                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-2 rounded-xl transition-all border", isAddingCourse ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-magic-accent/20 border-magic-accent/30 text-magic-accent hover:bg-magic-accent/30"),
                                                                                title: "添加课程",
                                                                                children: isAddingCourse ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                                    className: "w-4 h-4"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                    lineNumber: 1011,
                                                                                    columnNumber: 49
                                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                                    className: "w-4 h-4"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                    lineNumber: 1011,
                                                                                    columnNumber: 77
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1003,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex bg-white/5 p-1 rounded-xl border border-white/10",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        onClick: ()=>setScheduleView('week'),
                                                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all", scheduleView === 'week' ? "bg-magic-accent text-white shadow-lg" : "text-white/40 hover:text-white/60"),
                                                                                        children: "周"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1014,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        onClick: ()=>setScheduleView('day'),
                                                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all", scheduleView === 'day' ? "bg-magic-accent text-white shadow-lg" : "text-white/40 hover:text-white/60"),
                                                                                        children: "日"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1023,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1013,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1002,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 997,
                                                                columnNumber: 25
                                                            }, this),
                                                            isAddingCourse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                initial: {
                                                                    opacity: 0,
                                                                    height: 0
                                                                },
                                                                animate: {
                                                                    opacity: 1,
                                                                    height: 'auto'
                                                                },
                                                                exit: {
                                                                    opacity: 0,
                                                                    height: 0
                                                                },
                                                                className: "p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 overflow-hidden",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "grid grid-cols-2 gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                                value: newCourse.day,
                                                                                onChange: (e)=>setNewCourse({
                                                                                        ...newCourse,
                                                                                        day: e.target.value
                                                                                    }),
                                                                                className: "bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50",
                                                                                children: [
                                                                                    '周一',
                                                                                    '周二',
                                                                                    '周三',
                                                                                    '周四',
                                                                                    '周五',
                                                                                    '周六',
                                                                                    '周日'
                                                                                ].map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: d,
                                                                                        children: d
                                                                                    }, d, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1049,
                                                                                        columnNumber: 86
                                                                                    }, this))
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1044,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                                value: newCourse.type,
                                                                                onChange: (e)=>setNewCourse({
                                                                                        ...newCourse,
                                                                                        type: e.target.value
                                                                                    }),
                                                                                className: "bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: "校内",
                                                                                        children: "校内"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1056,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: "课外",
                                                                                        children: "课外"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1057,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1051,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1043,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "text",
                                                                        placeholder: "课程名称 (如: 魔法数学)",
                                                                        value: newCourse.subject,
                                                                        onChange: (e)=>setNewCourse({
                                                                                ...newCourse,
                                                                                subject: e.target.value
                                                                            }),
                                                                        className: "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1060,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "text",
                                                                        placeholder: "时间 (如: 09:00 - 10:30)",
                                                                        value: newCourse.time,
                                                                        onChange: (e)=>setNewCourse({
                                                                                ...newCourse,
                                                                                time: e.target.value
                                                                            }),
                                                                        className: "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1067,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: handleAddCourse,
                                                                        className: "w-full py-2 bg-magic-accent text-white rounded-lg text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all",
                                                                        children: "添加魔法课程"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1074,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1037,
                                                                columnNumber: 27
                                                            }, this),
                                                            scheduleView === 'day' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-2 overflow-x-auto pb-2 px-1 custom-scrollbar",
                                                                children: [
                                                                    '周一',
                                                                    '周二',
                                                                    '周三',
                                                                    '周四',
                                                                    '周五',
                                                                    '周六',
                                                                    '周日'
                                                                ].map((day)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>setSelectedDay(day),
                                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all border", selectedDay === day ? "bg-white/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"),
                                                                        children: day
                                                                    }, day, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1086,
                                                                        columnNumber: 31
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1084,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 996,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 gap-3 mt-4",
                                                        children: courses.filter((item)=>scheduleView === 'week' || item.day === selectedDay).map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                layout: true,
                                                                initial: {
                                                                    opacity: 0,
                                                                    x: -10
                                                                },
                                                                animate: {
                                                                    opacity: 1,
                                                                    x: 0
                                                                },
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-4 rounded-2xl border flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-default", item.color),
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex flex-col",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-[10px] font-bold uppercase tracking-wider opacity-60",
                                                                                        children: item.day
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1116,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                        className: "font-medium text-white",
                                                                                        children: item.subject
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1117,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1115,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", item.type === '校内' ? "bg-white/10 text-white/60" : "bg-magic-accent/20 text-magic-accent"),
                                                                                children: item.type
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1119,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1114,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs text-white/40 font-mono",
                                                                        children: item.time
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1126,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, `${item.day}-${item.subject}-${idx}`, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1107,
                                                                columnNumber: 27
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1103,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 994,
                                                columnNumber: 21
                                            }, this),
                                            sidebarContentType === 'exercise' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-xs font-bold uppercase tracking-widest text-white/40 px-2 flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2d$circuit$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BrainCircuit$3e$__["BrainCircuit"], {
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1138,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "魔法知识图谱"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1137,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-1 gap-2",
                                                                children: knowledgeGraph.map((point, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex flex-col",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-[10px] text-white/40 uppercase tracking-wider",
                                                                                        children: point.subject
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1145,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-sm text-white font-medium",
                                                                                        children: point.name
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1146,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1144,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", point.status === 'mastered' ? "bg-emerald-500/20 text-emerald-400" : "bg-magic-accent/20 text-magic-accent animate-pulse"),
                                                                                children: point.status === 'mastered' ? '已掌握' : '修炼中'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1148,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, idx, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1143,
                                                                        columnNumber: 29
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1141,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1136,
                                                        columnNumber: 23
                                                    }, this),
                                                    dynamicExercises ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between px-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "text-xs font-bold uppercase tracking-widest text-white/40",
                                                                        children: [
                                                                            "互动练习：",
                                                                            dynamicExercises.subject
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1163,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] text-magic-accent font-bold",
                                                                        children: [
                                                                            currentExerciseIndex + 1,
                                                                            " / ",
                                                                            dynamicExercises.questions.length
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1164,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1162,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4",
                                                                children: !showExerciseResult ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-sm text-white leading-relaxed",
                                                                            children: dynamicExercises.questions[currentExerciseIndex].question
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1170,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-2",
                                                                            children: dynamicExercises.questions[currentExerciseIndex].options.map((opt, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>setExerciseAnswers((prev)=>({
                                                                                                ...prev,
                                                                                                [dynamicExercises.questions[currentExerciseIndex].id]: opt
                                                                                            })),
                                                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-full p-3 rounded-xl border text-left text-xs transition-all", exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id] === opt ? "bg-magic-accent/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"),
                                                                                    children: opt
                                                                                }, idx, false, {
                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                    lineNumber: 1175,
                                                                                    columnNumber: 37
                                                                                }, this))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1173,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex gap-2 pt-2",
                                                                            children: [
                                                                                currentExerciseIndex > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>setCurrentExerciseIndex((prev)=>prev - 1),
                                                                                    className: "flex-1 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase",
                                                                                    children: "上一题"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                    lineNumber: 1191,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                currentExerciseIndex < dynamicExercises.questions.length - 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>setCurrentExerciseIndex((prev)=>prev + 1),
                                                                                    disabled: !exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id],
                                                                                    className: "flex-1 py-2 rounded-xl bg-magic-accent text-white text-[10px] font-bold uppercase disabled:opacity-50",
                                                                                    children: "下一题"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                    lineNumber: 1199,
                                                                                    columnNumber: 37
                                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>setShowExerciseResult(true),
                                                                                    disabled: !exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id],
                                                                                    className: "flex-1 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase disabled:opacity-50",
                                                                                    children: "提交魔法"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                    lineNumber: 1207,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1189,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "space-y-4 text-center py-4",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                                                                className: "w-8 h-8 text-emerald-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1220,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1219,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                            className: "text-lg font-serif italic text-white",
                                                                            children: "练习完成！"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1222,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs text-white/60",
                                                                            children: "你真棒！多比为你准备了详细的魔法解析。"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1223,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-4 text-left mt-6",
                                                                            children: dynamicExercises.questions.map((q, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "p-3 rounded-xl bg-white/5 border border-white/5 space-y-2",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center justify-between",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-[10px] font-bold text-white/40",
                                                                                                    children: [
                                                                                                        "第 ",
                                                                                                        idx + 1,
                                                                                                        " 题"
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                                    lineNumber: 1228,
                                                                                                    columnNumber: 41
                                                                                                }, this),
                                                                                                exerciseAnswers[q.id] === q.answer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-[10px] font-bold text-emerald-400 uppercase",
                                                                                                    children: "正确"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                                    lineNumber: 1230,
                                                                                                    columnNumber: 43
                                                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-[10px] font-bold text-magic-accent uppercase",
                                                                                                    children: "错误"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                                    lineNumber: 1232,
                                                                                                    columnNumber: 43
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                            lineNumber: 1227,
                                                                                            columnNumber: 39
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-xs text-white/80",
                                                                                            children: q.question
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                            lineNumber: 1235,
                                                                                            columnNumber: 39
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-[10px] text-emerald-400/80 leading-relaxed italic",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "font-bold",
                                                                                                    children: "魔法解析："
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                                    lineNumber: 1237,
                                                                                                    columnNumber: 41
                                                                                                }, this),
                                                                                                q.explanation
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                            lineNumber: 1236,
                                                                                            columnNumber: 39
                                                                                        }, this)
                                                                                    ]
                                                                                }, idx, true, {
                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                    lineNumber: 1226,
                                                                                    columnNumber: 37
                                                                                }, this))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1224,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>setDynamicExercises(null),
                                                                            className: "w-full py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all",
                                                                            children: "返回图谱"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1242,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1218,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1167,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1161,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center text-center gap-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-12 h-12 rounded-full bg-magic-accent/10 flex items-center justify-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__["Wand2"], {
                                                                    className: "w-6 h-6 text-magic-accent"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1255,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1254,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "text-sm font-medium text-white",
                                                                        children: "暂无动态练习"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1258,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-white/40 leading-relaxed",
                                                                        children: "你可以对多比说“我想练习一下分数乘法”，多比会立刻为你生成专属题目！"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1259,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1257,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1253,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 1134,
                                                columnNumber: 21
                                            }, this),
                                            sidebarContentType === 'image' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 min-h-[200px] flex items-center justify-center",
                                                        children: generatedImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: generatedImage,
                                                            alt: "魔法生成图片",
                                                            className: "w-full h-auto object-cover",
                                                            referrerPolicy: "no-referrer"
                                                        }, void 0, false, {
                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                            lineNumber: 1272,
                                                            columnNumber: 27
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                    className: "w-8 h-8 text-magic-accent animate-pulse"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1280,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-white/40 italic",
                                                                    children: "正在绘制魔法图像..."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1281,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                            lineNumber: 1279,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1270,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between px-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                                                        className: "w-3 h-3 text-white/40"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1287,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] text-white/40 uppercase tracking-wider",
                                                                        children: "多比的魔法绘图"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1288,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1286,
                                                                columnNumber: 25
                                                            }, this),
                                                            generatedImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    const link = document.createElement('a');
                                                                    link.href = generatedImage;
                                                                    link.download = 'magic-image.png';
                                                                    link.click();
                                                                },
                                                                className: "text-[10px] text-magic-accent hover:underline font-bold uppercase tracking-wider",
                                                                children: "保存魔法"
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1291,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1285,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 1269,
                                                columnNumber: 21
                                            }, this),
                                            sidebarContentType === 'achievements' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-6 rounded-3xl bg-gradient-to-br from-magic-accent to-orange-600 shadow-lg shadow-magic-accent/20",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between mb-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex flex-col",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-[10px] font-bold uppercase tracking-[0.2em] text-white/60",
                                                                                children: "当前等级"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1313,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-white font-serif font-bold text-lg",
                                                                                children: level
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1314,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1312,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                                        className: "w-4 h-4 text-white/60"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1316,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1311,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-baseline gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-4xl font-serif font-bold text-white",
                                                                        children: points
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1319,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-sm text-white/60 font-medium",
                                                                        children: "pts"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1320,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1318,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000",
                                                                    style: {
                                                                        width: `${Math.min(100, points % 1000 / 10)}%`
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1323,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1322,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] mt-2 text-white/60",
                                                                children: [
                                                                    "距离下一等级还差 ",
                                                                    1000 - points % 1000,
                                                                    " 积分"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1328,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1310,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-5 rounded-3xl bg-emerald-900/40 border border-emerald-500/20 backdrop-blur-sm",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between mb-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$leaf$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Leaf$3e$__["Leaf"], {
                                                                                className: "w-4 h-4 text-emerald-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1335,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                className: "text-sm font-serif italic text-emerald-100",
                                                                                children: "知识之树"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1336,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1334,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] text-emerald-400 font-bold uppercase tracking-widest",
                                                                        children: [
                                                                            "等级 ",
                                                                            Math.floor(treeGrowth / 5) + 1
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1338,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1333,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "relative h-32 flex items-end justify-center mb-4",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    viewBox: "0 0 100 100",
                                                                    className: "w-24 h-24",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].path, {
                                                                            d: "M50 90 L50 60",
                                                                            stroke: "#5d4037",
                                                                            strokeWidth: "4",
                                                                            fill: "none",
                                                                            initial: {
                                                                                pathLength: 0
                                                                            },
                                                                            animate: {
                                                                                pathLength: 1
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1344,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        treeGrowth > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].circle, {
                                                                            cx: "50",
                                                                            cy: "50",
                                                                            r: Math.min(30, 10 + treeGrowth * 2),
                                                                            fill: "#2e7d32",
                                                                            fillOpacity: "0.6",
                                                                            initial: {
                                                                                scale: 0
                                                                            },
                                                                            animate: {
                                                                                scale: 1
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1353,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        treeGrowth > 10 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].circle, {
                                                                            cx: "35",
                                                                            cy: "40",
                                                                            r: "15",
                                                                            fill: "#43a047",
                                                                            fillOpacity: "0.5",
                                                                            initial: {
                                                                                scale: 0
                                                                            },
                                                                            animate: {
                                                                                scale: 1
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1362,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        treeGrowth > 20 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].circle, {
                                                                            cx: "65",
                                                                            cy: "40",
                                                                            r: "15",
                                                                            fill: "#43a047",
                                                                            fillOpacity: "0.5",
                                                                            initial: {
                                                                                scale: 0
                                                                            },
                                                                            animate: {
                                                                                scale: 1
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1371,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1343,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1341,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: waterTree,
                                                                disabled: points < 50,
                                                                className: "w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"], {
                                                                        className: "w-4 h-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1387,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "灌溉知识之树 (50 pts)"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1382,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1332,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-xs font-bold uppercase tracking-widest text-white/40 px-2",
                                                                children: "每日魔法任务"
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1394,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-2",
                                                                children: dailyTasks.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>completeTask(task.id),
                                                                        disabled: task.completed,
                                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left", task.completed ? "bg-white/5 border-white/5 opacity-60" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-magic-accent/30"),
                                                                        children: [
                                                                            task.completed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                                className: "w-5 h-5 text-emerald-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1409,
                                                                                columnNumber: 33
                                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
                                                                                className: "w-5 h-5 text-white/20"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1411,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex-1",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm font-medium", task.completed ? "text-white/40 line-through" : "text-white"),
                                                                                        children: task.text
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1414,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-[10px] text-magic-accent font-bold",
                                                                                        children: [
                                                                                            "+",
                                                                                            task.reward,
                                                                                            " pts"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1417,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1413,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, task.id, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1397,
                                                                        columnNumber: 29
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1395,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1393,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-xs font-bold uppercase tracking-widest text-white/40 px-2",
                                                                children: "荣誉记录"
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1426,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-1 gap-3",
                                                                children: achievements.map((ach)=>{
                                                                    const IconComponent = {
                                                                        Award: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"],
                                                                        Trophy: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"],
                                                                        Star: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"],
                                                                        Medal: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$medal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Medal$3e$__["Medal"]
                                                                    }[ach.iconName] || __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"];
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-3 rounded-xl bg-white/5", ach.color),
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(IconComponent, {
                                                                                    className: "w-5 h-5"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                    lineNumber: 1433,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1432,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex-1",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                        className: "text-sm font-medium text-white",
                                                                                        children: ach.title
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1436,
                                                                                        columnNumber: 35
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-[10px] text-white/40 uppercase tracking-wider",
                                                                                        children: ach.date
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                        lineNumber: 1437,
                                                                                        columnNumber: 35
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1435,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$medal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Medal$3e$__["Medal"], {
                                                                                className: "w-4 h-4 text-white/10 group-hover:text-magic-accent transition-colors"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1439,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, ach.id || ach.title, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1431,
                                                                        columnNumber: 31
                                                                    }, this);
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1427,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1425,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "w-full py-4 rounded-2xl border border-dashed border-white/10 text-white/30 text-xs hover:border-magic-accent/40 hover:text-magic-accent/60 transition-all flex items-center justify-center gap-2 group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-6 h-6 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-lg leading-none",
                                                                    children: "+"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1449,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1448,
                                                                columnNumber: 25
                                                            }, this),
                                                            "记录新成就"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1447,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 1308,
                                                columnNumber: 21
                                            }, this),
                                            sidebarContentType === 'focus' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center relative overflow-hidden",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "absolute inset-0 opacity-10 pointer-events-none",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "absolute top-0 left-0 w-full h-full bg-gradient-to-b from-magic-accent to-transparent"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1461,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1460,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "relative mb-6",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                        animate: isFocusActive ? {
                                                                            rotate: 180
                                                                        } : {
                                                                            rotate: 0
                                                                        },
                                                                        transition: {
                                                                            duration: 2,
                                                                            repeat: isFocusActive ? Infinity : 0,
                                                                            ease: "easeInOut"
                                                                        },
                                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-24 h-24 flex items-center justify-center", isHourglassBroken && "animate-shake"),
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hourglass$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hourglass$3e$__["Hourglass"], {
                                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-16 h-16 transition-colors", isFocusActive ? "text-magic-accent" : "text-white/20", isHourglassBroken && "text-red-500")
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1470,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1465,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    isHourglassBroken && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute inset-0 flex items-center justify-center",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                            className: "w-20 h-20 text-red-500/50"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1474,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1473,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1464,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1 mb-8",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "text-3xl font-mono font-bold text-white tracking-widest",
                                                                        children: [
                                                                            Math.floor(focusTime / 60).toString().padStart(2, '0'),
                                                                            ":",
                                                                            (focusTime % 60).toString().padStart(2, '0')
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1480,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-white/40 uppercase tracking-widest font-bold",
                                                                        children: isFocusActive ? '专注魔法生效中...' : isHourglassBroken ? '魔法沙漏已碎裂' : '准备好开始专注了吗？'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1484,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1479,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-3 w-full",
                                                                children: [
                                                                    !isFocusActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>{
                                                                            setIsFocusActive(true);
                                                                            setIsHourglassBroken(false);
                                                                            setFocusTime(25 * 60);
                                                                        },
                                                                        className: "flex-1 py-3 rounded-xl bg-magic-accent text-white text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-105 transition-all",
                                                                        children: "开启沙漏"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1491,
                                                                        columnNumber: 29
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>setIsFocusActive(false),
                                                                        className: "flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all",
                                                                        children: "暂停魔法"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1502,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    (isHourglassBroken || !isFocusActive && focusTime < 25 * 60) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>{
                                                                            setFocusTime(25 * 60);
                                                                            setIsHourglassBroken(false);
                                                                        },
                                                                        className: "p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1517,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1510,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1489,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1459,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-xs font-bold uppercase tracking-widest text-white/40 px-2",
                                                                children: "背景魔法音"
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1525,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-2 gap-2",
                                                                children: [
                                                                    {
                                                                        id: 'none',
                                                                        name: '静音',
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__["VolumeX"]
                                                                    },
                                                                    {
                                                                        id: 'library',
                                                                        name: '魔法图书馆',
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$library$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Library$3e$__["Library"]
                                                                    },
                                                                    {
                                                                        id: 'rain',
                                                                        name: '禁林细雨',
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$rain$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudRain$3e$__["CloudRain"]
                                                                    },
                                                                    {
                                                                        id: 'fire',
                                                                        name: '休息室壁炉',
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"]
                                                                    }
                                                                ].map((sound)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>{
                                                                            setWhiteNoise(sound.id);
                                                                            // Explicitly trigger play on click to satisfy browser autoplay policies
                                                                            if (sound.id !== 'none' && audioRef.current) {
                                                                                audioRef.current.play().catch(()=>{});
                                                                            }
                                                                        },
                                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all", whiteNoise === sound.id ? "bg-magic-accent/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"),
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(sound.icon, {
                                                                                className: "w-5 h-5"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1549,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-[10px] font-bold",
                                                                                children: sound.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                                lineNumber: 1550,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, sound.id, true, {
                                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                        lineNumber: 1533,
                                                                        columnNumber: 29
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                lineNumber: 1526,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1524,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-4 rounded-2xl bg-white/5 border border-white/10",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-start gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                    className: "w-4 h-4 text-magic-accent shrink-0 mt-0.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1559,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[10px] text-white/60 leading-relaxed",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-white font-bold",
                                                                            children: "魔法提示："
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                            lineNumber: 1561,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        "在沙漏开启期间，请不要离开这个页面。如果你切换标签页或去玩手机，魔法沙漏就会碎掉哦！"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                                    lineNumber: 1560,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                            lineNumber: 1558,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                        lineNumber: 1557,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 1457,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 980,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 pt-6 border-t border-white/5 flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSidebarContentType('schedule'),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'schedule' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10"),
                                                children: "课程表"
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 1571,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSidebarContentType('exercise'),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'exercise' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10"),
                                                children: "练习题"
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 1577,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSidebarContentType('achievements'),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'achievements' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10"),
                                                children: "成就墙"
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 1583,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSidebarContentType('focus'),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", sidebarContentType === 'focus' ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10"),
                                                children: "专注"
                                            }, void 0, false, {
                                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                                lineNumber: 1589,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                        lineNumber: 1570,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 966,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                            lineNumber: 959,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                        lineNumber: 957,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                lineNumber: 752,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "md:hidden flex items-center justify-around py-4 border-t border-white/5 bg-black/40 backdrop-blur-xl z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('chat'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center gap-1", activeTab === 'chat' ? "text-magic-accent" : "text-white/40"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 1608,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-bold uppercase tracking-tighter",
                                children: "对话"
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 1609,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                        lineNumber: 1604,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('library'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center gap-1", activeTab === 'library' ? "text-magic-accent" : "text-white/40"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 1615,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-bold uppercase tracking-tighter",
                                children: "书库"
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 1616,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                        lineNumber: 1611,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('profile'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center gap-1", activeTab === 'profile' ? "text-magic-accent" : "text-white/40"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 1622,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$TRAE$2f$dobby$2d$elf$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-bold uppercase tracking-tighter",
                                children: "我的"
                            }, void 0, false, {
                                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                                lineNumber: 1623,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                        lineNumber: 1618,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
                lineNumber: 1603,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/TRAE/dobby-elf/app/MagicApp.tsx",
        lineNumber: 666,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__35e6d9f3._.js.map