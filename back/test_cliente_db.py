print("=== START test_cliente_db.py ===")

from sqlalchemy import text, select
from app.database import SessionLocal
from app.models.cliente import Cliente


def main():
    db = None
    try:
        db = SessionLocal()
        print("✅ Session creada")

        r = db.execute(text("SELECT 1")).scalar()
        print("✅ SELECT 1 =>", r)

        base = "TSTCLI"
        i = 1
        while True:
            candidate = f"{base}{i:03d}"
            existe = db.execute(select(Cliente).where(Cliente.id_cliente == candidate)).scalar_one_or_none()
            if not existe:
                id_cliente = candidate
                break
            i += 1

        nuevo = Cliente(
            id_sociedad="01",
            id_cliente=id_cliente,
            n_cliente="CLIENTE PRUEBA",
            cif="12345678Z",
            persona_contacto="Persona Test",
            direccion="Direccion Test",
        )

        db.add(nuevo)
        db.commit()
        print(f"✅ Insertado cliente: {id_cliente}")

        encontrado = db.execute(select(Cliente).where(Cliente.id_cliente == id_cliente)).scalar_one_or_none()
        if not encontrado:
            print("❌ No se encontro el cliente tras insertarlo")
            return

        print("✅ Leido:", encontrado.id_cliente, encontrado.n_cliente, encontrado.cif)

        db.delete(encontrado)
        db.commit()
        print(f"🧹 Borrado cliente de prueba: {id_cliente}")

    except Exception as e:
        if db:
            db.rollback()
        print("❌ ERROR:", repr(e))

    finally:
        if db:
            db.close()
        print("=== END test_cliente_db.py ===")


if __name__ == "__main__":
    main()