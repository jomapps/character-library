'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ApiEndpoint, ApiField } from '@/lib/api-endpoints'
import { Play, Loader2 } from 'lucide-react'

interface DynamicFormProps {
  endpoint: ApiEndpoint
  onSubmit: (data: any) => void
  isLoading?: boolean
}

function createValidationSchema(fields: ApiField[]) {
  const schemaFields: Record<string, any> = {}

  fields.forEach((field) => {
    let fieldSchema: any

    switch (field.type) {
      case 'string':
        fieldSchema = z.string()
        if (field.required) {
          fieldSchema = fieldSchema.min(1, `${field.name} is required`)
        } else {
          fieldSchema = fieldSchema.optional()
        }
        break
      case 'number':
        fieldSchema = z.coerce.number()
        if (field.required) {
          fieldSchema = fieldSchema.min(0, `${field.name} must be a positive number`)
        } else {
          fieldSchema = fieldSchema.optional()
        }
        break
      case 'boolean':
        fieldSchema = z.boolean().optional()
        break
      case 'array':
        fieldSchema = z.string().optional().transform((val) => {
          if (!val) return []
          return val.split(',').map(item => item.trim()).filter(Boolean)
        })
        break
      case 'object':
        fieldSchema = z.string().optional().transform((val) => {
          if (!val) return undefined
          try {
            return JSON.parse(val)
          } catch {
            throw new Error(`Invalid JSON in ${field.name}`)
          }
        })
        break
      case 'select':
        fieldSchema = z.string()
        if (field.required) {
          fieldSchema = fieldSchema.min(1, `${field.name} is required`)
        } else {
          fieldSchema = fieldSchema.optional()
        }
        break
      default:
        fieldSchema = z.string().optional()
    }

    schemaFields[field.name] = fieldSchema
  })

  return z.object(schemaFields)
}

export function DynamicForm({ endpoint, onSubmit, isLoading = false }: DynamicFormProps) {
  const schema = createValidationSchema(endpoint.fields)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: endpoint.fields.reduce((acc, field) => {
      if (field.defaultValue !== undefined) {
        acc[field.name] = field.defaultValue
      }
      return acc
    }, {} as Record<string, any>),
  })

  const handleFormSubmit = (data: any) => {
    // Clean up the data
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, any>)

    onSubmit(cleanedData)
  }

  const renderField = (field: ApiField) => {
    const error = errors[field.name]

    switch (field.type) {
      case 'boolean':
        return (
          <div key={field.name} className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register(field.name)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.name}
                {field.required && <span className="ml-1 text-red-500">*</span>}
              </span>
            </label>
            {field.description && (
              <p className="ml-7 text-xs text-gray-500">
                {field.description}
              </p>
            )}
            {error && (
              <p className="ml-7 text-xs text-red-600">
                {error.message}
              </p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.name}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <select
              {...register(field.name)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select an option</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {field.description && (
              <p className="text-xs text-gray-500">
                {field.description}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600">
                {error.message}
              </p>
            )}
          </div>
        )

      case 'object':
      case 'array':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.name}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <textarea
              {...register(field.name)}
              placeholder={field.placeholder}
              rows={3}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {field.description && (
              <p className="text-xs text-gray-500">
                {field.description}
                {field.type === 'array' && ' (comma-separated values)'}
                {field.type === 'object' && ' (JSON format)'}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600">
                {error.message}
              </p>
            )}
          </div>
        )

      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.name}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              {...register(field.name)}
              placeholder={field.placeholder}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {field.description && (
              <p className="text-xs text-gray-500">
                {field.description}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600">
                {error.message}
              </p>
            )}
          </div>
        )
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {endpoint.fields.length > 0 ? (
        <div className="space-y-4">
          {endpoint.fields.map(renderField)}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No parameters required for this endpoint
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Execute Request
            </>
          )}
        </button>
      </div>
    </form>
  )
}
