export const StorageConfig = {
    flags: {
        destination: '../../Storages/storage/flags',
        urlPrefix: '/assets/photos/',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        maxSize: 1024 * 1024 * 300,
    },

    profile: {
        destination: '../../Storages/storage/flags/profile',
        urlPrefix: '/assets/photos/',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        maxSize: 1024 * 1024 * 300,
    }
}