import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z, ZodType, ZodObject } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFormMetadata } from "shared/src/decorators";
import { IconDeviceFloppy, IconLock, IconTrash } from "@tabler/icons-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type CrudFormProps<TSchema extends ZodType<any>> = {
  schema: TSchema;
  cls: new (...args: any[]) => z.infer<TSchema>;
  item?: z.infer<TSchema>;
  hiddenFields?: string[];
  readOnlyFields?: string[];
  onCreate?: (data: z.infer<TSchema>) => Promise<void> | void;
  onUpdate?: (data: z.infer<TSchema>) => Promise<void> | void;
  onDelete?: (data: z.infer<TSchema>) => Promise<void> | void;
};

export function ModelForm<TSchema extends ZodObject<any>>({
  schema,
  cls,
  item,
  hiddenFields = [],
  readOnlyFields = [],
  onCreate,
  onUpdate,
  onDelete,
}: CrudFormProps<TSchema>) {
  type T = z.infer<TSchema>;
  const metadata = getFormMetadata(cls);
  const [isSaveProcessing, setIsSaveProcessing] = useState(false);
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);

  // Removed "values" prop; rely on reset()
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: item ?? (new cls() as any),
  });

  // Reset form when "item" changes
  useEffect(() => {
    console.log("reset ModelForm");
    form.reset(item ?? (new cls() as any));
  }, [item, form]);

  const handleSubmit = async (data: T) => {
    try {
      setIsSaveProcessing(true);
      if (item && onUpdate) {
        await onUpdate(data);
      } else if (!item && onCreate) {
        await onCreate(data);
        form.reset(new cls() as any);
      }
    } finally {
      setIsSaveProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleteProcessing(true);
      if (item && onDelete) {
        await onDelete(item);
        form.reset(new cls() as any);
      }
    } finally {
      setIsDeleteProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="flex justify-between items-center w-full">
          <Button
            variant="outline"
            size="icon"
            aria-label="Submit"
            type="submit"
            disabled={isSaveProcessing}
          >
            {isSaveProcessing ? (
              <Spinner />
            ) : (
              <IconDeviceFloppy className="!size-5" />
            )}
          </Button>
          {item && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              aria-label="Delete"
              onClick={handleDelete}
              disabled={isDeleteProcessing}
            >
              {isDeleteProcessing ? (
                <Spinner />
              ) : (
                <IconTrash className="!size-5" />
              )}
            </Button>
          )}
        </div>

        {metadata
          .filter((field: any) => !hiddenFields.includes(field.propertyKey))
          .map((field: any) => {
            const isReadOnly = readOnlyFields.includes(field.propertyKey);
            const readOnlyClass = isReadOnly
              ? "opacity-50 cursor-not-allowed"
              : "";

            return (
              <FormField
                key={field.propertyKey}
                control={form.control}
                name={field.propertyKey as any}
                render={({ field: rhfField }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      {field.options.label}
                      {isReadOnly && (
                        <IconLock
                          size={14}
                          stroke={1.5}
                          className="text-muted-foreground"
                        />
                      )}
                    </FormLabel>
                    <FormControl>
                      {(() => {
                        switch (field.type) {
                          case "text":
                            return (
                              <Input
                                {...rhfField}
                                value={rhfField.value ?? ""}
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                                className={readOnlyClass}
                              />
                            );

                          case "number":
                            return (
                              <Input
                                type="number"
                                value={rhfField.value ?? ""}
                                onChange={(e) =>
                                  rhfField.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value)
                                  )
                                }
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                                className={readOnlyClass}
                              />
                            );

                          case "checkbox":
                            return (
                              <div
                                className={`flex items-center gap-2 ${readOnlyClass}`}
                              >
                                <Checkbox
                                  checked={rhfField.value}
                                  onCheckedChange={rhfField.onChange}
                                  disabled={isReadOnly}
                                />
                              </div>
                            );

                          case "datetime": {
                            const val = rhfField.value as any;
                            const formatted =
                              val instanceof Date
                                ? val.toISOString().slice(0, 16)
                                : val || "";
                            return (
                              <Input
                                type="datetime-local"
                                value={formatted}
                                onChange={(e) =>
                                  rhfField.onChange(new Date(e.target.value))
                                }
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                                className={readOnlyClass}
                              />
                            );
                          }

                          case "select":
                            return (
                              <div className={readOnlyClass}>
                                <Select
                                  onValueChange={rhfField.onChange}
                                  value={rhfField.value}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.options?.map(
                                      (opt: string) => (
                                        <SelectItem key={opt} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            );

                          default:
                            return (
                              <Input
                                {...rhfField}
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                                className={readOnlyClass}
                              />
                            );
                        }
                      })()}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
      </form>
    </Form>
  );
}
