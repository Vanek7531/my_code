import { computed, Ref, ref } from 'vue'
import { BOOK_QUERY, COURSE_BOOKS_QUERY } from '~/graphql/queries/books.query'
import { BookInBooksInt, BooksInt } from '~/interfaces/useCourseInterfaces'
import router from '~/router'
import { useQueryApollo, useRouteParams } from './helper'
import { appRoute, search } from './useApp'
import { course } from './useCourse'
import { loadCompleteCourse, sidebarWidth } from './useStudy'

export const isCoursesBooks = ref(false)
export const books: Ref<BooksInt[] | []> = ref([])
export const book = ref<BookInBooksInt | null>(null)
export const currentChapeterId: Ref<number> = ref(0)
export const currentParentId: Ref<number> = ref(0)
export const currentBookInCourse: Ref<boolean> = ref(true)

export const isOpenMenu = ref(false)
export const devStatusProjects = () => {
    return process.env.NODE_ENV === 'development' ? true : false
}

const openBook = ref(false)
const isBook = ref(false)
let courseId = 0

const useloadBooksCourse = async (): Promise<void> => {
    courseId =
        loadCompleteCourse.value === true && course.value
            ? course.value.id
            : useRouteParams('courseId')

    // courseId = 438
    if (courseId > 0) {
        books.value = await useQueryApollo(
            COURSE_BOOKS_QUERY,
            { courseId },
            'getBooks'
        )
        isCoursesBooks.value = true
    }
}

export const allBooksInCourse = () => {
    const loadBooks = async () => {
        if (appRoute.value.name === 'Books') {
            await useloadBooksCourse()
        }
    }

    const openChapter = (id: number, parentId: number = 0): void => {
        currentChapeterId.value = id
        currentParentId.value = parentId

        setTimeout(() => {
            let el = document.getElementById('idBook')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 1)

        if (
            document.documentElement.clientWidth &&
            document.documentElement.clientWidth < 476
        ) {
            isOpenMenu.value = false
        }
    }

    const isSearch = (value: string): boolean => {
        const searchText = search.value.toLowerCase()
        return value.toString().toLowerCase().indexOf(searchText) !== -1
    }

    const booksFilter: Ref<BooksInt[] | []> = computed(() => {
        if (books.value === null) return []

        if (search.value && search.value.length > 0 && books.value !== null) {
            return books.value.filter((el) => isSearch(el.name))
        }
        return books.value
    })

    loadBooks().then(() => {})

    return {
        openChapter,
        devStatusProjects,
        loadBooks,
        books,
        isCoursesBooks,
        isBook,
        booksFilter,
    }
}

export const useCurrentBook = () => {
    const loadBook = async (id: number) => {
        await useloadBooksCourse().then(() => {
            useloadBook(id)
        })
    }

    const useloadBook = async (id: number): Promise<void> => {
        currentChapeterId.value = 0
        let bookId = id
        if (bookId) {
            book.value = await useQueryApollo(
                BOOK_QUERY,
                { bookId },
                'getBook'
            ).catch((error) => {
                router.push('book/not-found')
            })
            isBook.value = true
            if (book.value) {
                //проверка на наличие книги в курсе
                // currentBookInCourse.value = books.value
                //     .map((el) => el.id)
                //     .includes(book.value.id)

                currentChapeterId.value = book.value.chapters[0].id
            }
        }
    }

    const bookIsOpen = computed(() => {
        return openBook.value ? true : false
    })

    const filterChapterLvl = (chapter: any, level: number, content: string) => {
        if (chapter && content === 'name') {
            return chapter.level === level ? chapter.name : null
        }
        if (chapter && content === 'id') {
            return chapter.level === level ? chapter.id : null
        }
        if (chapter && content === 'parentId') {
            return chapter.level === level ? chapter.parentId : null
        }
        if (chapter && content === 'content') {
            return chapter.level === level ? chapter.content : null
        }
        return null
    }

    const chapterLvl = (level: number) => {
        if (book.value && isBook.value && book.value.chapters) {
            return book.value.chapters.filter((el: any) => el.level === level)
        }
    }

    const getClassCurrentChapter = (idChapter: number): string => {
        if (currentChapeterId.value) {
            return currentChapeterId.value === idChapter ||
                currentParentId.value === idChapter
                ? 'active'
                : 'none'
        }
        return ''
    }

    const parentChapter = (parentLvl: number) => {
        if (parentLvl && book.value) {
            return book.value.chapters.filter(
                (el: any) => el.parentId === parentLvl
            )
        }
        return []
    }
    const currentChapter = computed(() => {
        if (currentChapeterId.value && book.value && book.value.chapters) {
            return book.value.chapters.find(
                (el: any) => el.id === currentChapeterId.value
            )
        }
        return null
    })

    const showIcon = (id: number) => {
        if (book.value) {
            return book.value.chapters.filter((el: any) => el.parentId == id)
                .length == 0
                ? 'none'
                : ''
        }
    }

    const openMenu = (): void => {
        isOpenMenu.value = !isOpenMenu.value
    }

    const bookMenuWidth = () => {
        return isOpenMenu.value !== true
            ? '90%'
            : `calc(100% - ${sidebarWidth.value}px)`
    }

    const watchWhatVersion = computed((): boolean => {
        return document.documentElement.clientWidth <= 425 ? true : false
    })

    let tooltipShow = ref(false)

    const bookNameSlice = (): string => {
        if (!book.value) return ''

        if (book.value.name.length > 180 && !watchWhatVersion.value) {
            tooltipShow.value = true
            return `${book.value.name.slice(0, 190)}...`
        } else if (book.value.name.length > 160 && watchWhatVersion.value) {
            tooltipShow.value = true

            return `${book.value.name.slice(0, 155)}...`
        }
        tooltipShow.value = false

        return book.value.name
    }

    return {
        tooltipShow,
        bookNameSlice,
        getClassCurrentChapter,
        currentChapter,
        bookMenuWidth,
        sidebarWidth,
        openMenu,
        isOpenMenu,
        isBook,
        showIcon,
        openBook,
        filterChapterLvl,
        chapterLvl,
        parentChapter,
        book,
        bookIsOpen,
        loadBook,
        currentBookInCourse,
    }
}
