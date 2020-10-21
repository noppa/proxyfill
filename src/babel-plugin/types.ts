type FilePath = string

export type VisitorState = {
	hasBeenImported: Map<FilePath, boolean>
}
