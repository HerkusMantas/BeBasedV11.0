let idCounter = 100;
export const NodeService = {
    getTreeNodes() {
        // Pavyzdiniai duomenys
        return Promise.resolve([
            {
                key: `${idCounter++}`,           // Unikalus raktas
                parentKey: 0,
                label: 'Folder',
                icon: 'pi pi-fw pi-folder',
                showButton: true,
                children: [
                    {
                        key: `${idCounter++}`,           // Unikalus raktas
                        parentKey: 0,
                        label: 'Folder',
                        icon: 'pi pi-fw pi-folder',
                        showButton: true,
                        children: [],
                    },
                    {
                        key: `${idCounter++}`,           // Unikalus raktas
                        parentKey: 0,
                        label: 'New Canvas',
                        icon: 'pi pi-fw pi-file',
                        showButton: true,
                    }
                ]
            }
        ]);
    }
};
