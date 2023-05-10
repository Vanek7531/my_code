<script setup lang="ts">
import { onBeforeMount } from 'vue'
import {
    allBooksInCourse,
    currentChapeterId,
    useCurrentBook,
} from '~/use/useBooks'

const {
    openBook,
    filterChapterLvl,
    chapterLvl,
    parentChapter,
    book,
    showIcon,
    loadBook,
    bookIsOpen,
    isOpenMenu,
    openMenu,
    sidebarWidth,
    getClassCurrentChapter,
    bookNameSlice,
    tooltipShow,
} = useCurrentBook()
const { openChapter } = allBooksInCourse()

onBeforeMount(() => {
    sidebarWidth.value =
        !window.screen.width || window.screen.width > 767
            ? 415
            : window.screen.width
})
</script>
<template>
    <!-- 
		
        @mouseleave="openMenu" -->

    <div class="learning-content">
        <!-- @mouseover="openMenu" -->
        <div
            class="learning-content--button__header"
            @click="openMenu"
            v-if="!isOpenMenu"
        >
            <div class="stripes-container">
                <div class="strip"></div>
                <div class="strip"></div>
                <div class="strip"></div>
            </div>
        </div>
        <div class="learning-content--button__text" v-if="!isOpenMenu">
            <p>{{ $t('book.courseContent') }}</p>
        </div>
    </div>
    <q-drawer
        v-model="isOpenMenu"
        :width="sidebarWidth"
        class="sidebar"
        v-if="book"
    >
        <div class="sidebar-content">
            <div class="sidebar-header">
                <div class="sidebar-header-info">
                    <div class="head_book-name">
                        {{ book.code }}. {{ bookNameSlice() }}
                        <q-tooltip class="text-body" self="top middle">
                            <p
                                style="font-size: 16px; width: 70vw"
                                v-if="tooltipShow"
                            >
                                {{ book.name }}
                            </p>
                        </q-tooltip>
                    </div>

                    <div class="sidebar-header-close" v-if="isOpenMenu">
                        <q-btn>
                            <q-icon name="close" @click="openMenu"></q-icon>
                        </q-btn>
                    </div>
                </div>
            </div>
            <div class="sidebar-main-content--themes">
                <div class="sidebar-main-content--themes--text">
                    <!-- <p>Оглавление</p> -->

                    <div
                        v-for="chap in chapterLvl(1)"
                        :key="chap.id"
                        class="item-level--first"
                    >
                        <q-btn
                            @click="openChapter(chap.id)"
                            :class="`${getClassCurrentChapter(chap.id)}`"
                        >
                            <div>{{ chap.name }}</div>
                        </q-btn>
                        <q-expansion-item
                            :id="currentChapeterId"
                            class="chapter-items"
                            :expand-icon="`${showIcon(chap.id)}`"
                            style="display: flex"
                        >
                            <div
                                v-for="chapter in parentChapter(chap.id)"
                                class="item-level--two"
                                :key="chapter.id"
                                :class="`${getClassCurrentChapter(chapter.id)}`"
                            >
                                <q-btn
                                    @click="
                                        openChapter(
                                            chapter.id,
                                            chapter.parentId
                                        )
                                    "
                                >
                                    <div v-if="chapter.name.length > 5">
                                        {{ chapter.name }}
                                    </div>
                                    <div v-else>Пункт: {{ chapter.name }}</div>
                                </q-btn>
                            </div>
                        </q-expansion-item>
                    </div>
                </div>
            </div>
        </div>
    </q-drawer>
</template>
<style lang="scss">
.table_сontents {
    // padding-top: 100px;
}
.item-level--first {
    // display: flex;
    // padding-left: 20px;

    width: 100%;
    // justify-content: space-between;
    // margin-bottom: 25px;
    position: relative;
    .chapter-first--level {
        margin-bottom: 10px;
    }
    .chapter-second--level {
        padding-left: 20px;
    }
    & > .q-btn {
        padding-left: 5px;

        padding-top: 12px;
        padding-bottom: 17px;
        border-radius: 0;
        width: 100%;
        text-align: start;
        &.active {
            box-shadow: 0px 0px 6px 4px rgb(8 104 64 / 12%);
        }
        span {
            & div {
                width: 90%;
            }
        }
    }
    .q-expansion-item__container {
        width: 100%;
    }
    .q-item--clickable {
        width: 30px;
        height: 40px;
        position: absolute !important;
        top: 0;
        // background: red;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        right: 10px;
        cursor: grab;
        font-size: 22px;
    }
}
.item-level--two {
    // margin-bottom: 15px;

    width: 100%;
    & .q-btn {
        padding-left: 20px;
        padding-top: 12px;
        padding-bottom: 12px;
        width: 98%;
        text-align: left;
        border-radius: 0px;
    }
    &.active {
        background: rgba(0, 135, 149, 0.09);
    }
}
</style>
<style scoped lang="scss">
.table_сontents {
    padding-top: 100px;

    .q-item--clickable {
        position: relative;
    }
}

.sidebar {
    .sidebar-content {
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);
        .sidebar-header {
            height: 150px;
            padding: 30px 40px 20px 20px;
            font-weight: 700;
            font-size: 14px;
        }
    }
    .sidebar-main-content--themes {
        height: calc(100% - 150px);
        .sidebar-main-content--themes--text {
            // padding-right: 5px;
        }
    }
}
</style>
