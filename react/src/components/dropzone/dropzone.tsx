import  {type ReactElement } from 'react';
import { useDropzone, type FileWithPath } from 'react-dropzone';
import { Card, Stack } from 'react-bootstrap';

/**
 * 1. DEFINE PROPS
 */
interface DropzoneElementProps {
    onDrop: (files: FileWithPath[]) => void;
    accept?: Record<string, string[]>;
    maxFiles?: number;
}

export function DropzoneElement({
                                    onDrop,
                                    accept,
                                    maxFiles
                                }: DropzoneElementProps): ReactElement {

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept,
        maxFiles,
    });

    /**
     * 3. DYNAMIC STYLING
     * We map react-dropzone states to Bootstrap utility classes.
     */
    const getVariantClasses = () => {
        if (isDragReject) return 'border-danger bg-danger-subtle text-danger';
        if (isDragActive) return 'border-primary bg-primary-subtle text-primary';
        return 'border-secondary-subtle bg-light text-muted';
    };

    return (
        <Card
            {...getRootProps()}
            className={`p-5 text-center border-2 ${getVariantClasses()}`}
            style={{
                borderStyle: 'dashed',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                minHeight: '200px'
            }}
        >
            <input {...getInputProps()} />

            <Stack gap={2} className="align-items-center justify-content-center h-100">
                {/* You can add a Bootstrap Icon here in 2026 */}
                <i className="bi bi-cloud-upload fs-1"></i>

                {isDragActive ? (
                    <p className="mb-0 fw-bold">Drop the files here ...</p>
                ) : (
                    <div>
                        <p className="mb-0 fw-bold text-dark">
                            Drag 'n' drop files here, or click to select
                        </p>
                        <p className="small mb-0">
                            Support for {accept ? Object.keys(accept).join(', ') : 'all file types'}
                        </p>
                    </div>
                )}

                {isDragReject && (
                    <p className="small mt-2 fw-bold">Some files are not supported!</p>
                )}
            </Stack>
        </Card>
    );
}