# UAA Docker configuration

## Requirements
- `ansible-playbook`
- `docker-compose`

## Update vars
Update `site.yml` with the required vars, then run

```bash
$ ansible-playbook -i hosts site.yml
```
to create the container.

## Test it out
```bash
$ docker-compose up
```
