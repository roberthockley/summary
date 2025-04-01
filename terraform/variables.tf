variable "project" {
  type = object({
    tla = string
  })
  sensitive = false
}

variable "environment" {
  type = object({
    name            = string
    region          = string
    account_id      = string
  })
  sensitive = false
}