import math
import sys
from pathlib import Path

from ortools.constraint_solver import pywrapcp, routing_enums_pb2


SCALE = 1000


def read_solomon_file(file_path):
    """Read a Solomon VRPTW instance."""

    lines = Path(file_path).read_text().splitlines()

    vehicle_count = None
    vehicle_capacity = None
    customers = []

    reading_customers = False

    for line in lines:
        parts = line.split()

        if not parts:
            continue

        # Vehicle information
        if parts[0].isdigit() and not reading_customers:
            if len(parts) >= 2 and vehicle_count is None:
                try:
                    vehicle_count = int(parts[0])
                    vehicle_capacity = int(parts[1])
                except ValueError:
                    pass

        # Customer section starts after CUSTOMER header
        if parts[0] == "CUSTOMER":
            reading_customers = True
            continue

        # Read customer rows
        if reading_customers and parts[0].isdigit() and len(parts) >= 7:
            try:
                customers.append({
                    "id": int(parts[0]),
                    "x": float(parts[1]),
                    "y": float(parts[2]),
                    "demand": int(parts[3]),
                    "ready": float(parts[4]),
                    "due": float(parts[5]),
                    "service": float(parts[6])
                })
            except ValueError:
                continue

    if not customers:
        raise ValueError("No customer data found in Solomon file.")

    return {
        "vehicle_count": vehicle_count,
        "vehicle_capacity": vehicle_capacity,
        "customers": customers
    }


def euclidean_distance(a, b):
    dx = a["x"] - b["x"]
    dy = a["y"] - b["y"]
    return math.sqrt(dx * dx + dy * dy)


def solve_vrptw(data, time_limit_seconds=30):

    customers = data["customers"]
    vehicle_count = data["vehicle_count"]
    vehicle_capacity = data["vehicle_capacity"]

    node_count = len(customers)

    manager = pywrapcp.RoutingIndexManager(
        node_count,
        vehicle_count,
        0
    )

    routing = pywrapcp.RoutingModel(manager)

    # ---------------------------------------------------------
    # DISTANCE CALLBACK
    # ---------------------------------------------------------

    def distance_callback(from_index, to_index):

        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)

        distance = euclidean_distance(
            customers[from_node],
            customers[to_node]
        )

        return int(round(distance * SCALE))

    distance_callback_index = routing.RegisterTransitCallback(
        distance_callback
    )

    routing.SetArcCostEvaluatorOfAllVehicles(
        distance_callback_index
    )

    # ---------------------------------------------------------
    # VEHICLE COUNT OBJECTIVE
    # ---------------------------------------------------------
    # Large fixed cost means:
    # 1. Minimize number of vehicles
    # 2. Then minimize distance

    FIXED_VEHICLE_COST = 1_000_000_000

    for vehicle_id in range(vehicle_count):
        routing.SetFixedCostOfVehicle(
            FIXED_VEHICLE_COST,
            vehicle_id
        )

    # ---------------------------------------------------------
    # CAPACITY CONSTRAINT
    # ---------------------------------------------------------

    def demand_callback(index):

        node = manager.IndexToNode(index)

        return customers[node]["demand"]

    demand_callback_index = routing.RegisterUnaryTransitCallback(
        demand_callback
    )

    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,
        [vehicle_capacity] * vehicle_count,
        True,
        "Capacity"
    )

    # ---------------------------------------------------------
    # TIME WINDOW CONSTRAINT
    # ---------------------------------------------------------

    def time_callback(from_index, to_index):

        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)

        travel_time = euclidean_distance(
            customers[from_node],
            customers[to_node]
        )

        service_time = customers[from_node]["service"]

        return int(round(
            (travel_time + service_time) * SCALE
        ))

    time_callback_index = routing.RegisterTransitCallback(
        time_callback
    )

    horizon = 10_000 * SCALE

    routing.AddDimension(
        time_callback_index,
        horizon,
        horizon,
        False,
        "Time"
    )

    time_dimension = routing.GetDimensionOrDie("Time")

    # Apply customer time windows
    for customer in customers:

        index = manager.NodeToIndex(customer["id"])

        ready = int(round(customer["ready"] * SCALE))
        due = int(round(customer["due"] * SCALE))

        time_dimension.CumulVar(index).SetRange(
            ready,
            due
        )

    # Apply depot time window to every vehicle
    depot = customers[0]

    depot_ready = int(round(depot["ready"] * SCALE))
    depot_due = int(round(depot["due"] * SCALE))

    for vehicle_id in range(vehicle_count):

        start_index = routing.Start(vehicle_id)
        end_index = routing.End(vehicle_id)

        time_dimension.CumulVar(start_index).SetRange(
            depot_ready,
            depot_due
        )

        time_dimension.CumulVar(end_index).SetRange(
            depot_ready,
            depot_due
        )

    # ---------------------------------------------------------
    # SEARCH SETTINGS
    # ---------------------------------------------------------

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()

    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )

    search_parameters.time_limit.seconds = time_limit_seconds

    # ---------------------------------------------------------
    # SOLVE
    # ---------------------------------------------------------

    print("Starting OR-Tools VRPTW optimization...")
    print(f"Vehicles available : {vehicle_count}")
    print(f"Vehicle capacity   : {vehicle_capacity}")
    print(f"Customers          : {node_count - 1}")
    print(f"Time limit         : {time_limit_seconds} seconds")
    print()

    solution = routing.SolveWithParameters(
        search_parameters
    )

    if solution is None:
        print("NO FEASIBLE SOLUTION FOUND.")
        return

    # ---------------------------------------------------------
    # RESULTS
    # ---------------------------------------------------------

    used_vehicles = 0
    total_distance = 0.0

    print("========================================")
    print("OR-TOOLS VRPTW OPTIMIZATION RESULT")
    print("========================================")

    for vehicle_id in range(vehicle_count):

        index = routing.Start(vehicle_id)

        if routing.IsEnd(
            solution.Value(routing.NextVar(index))
        ):
            continue

        used_vehicles += 1

        route = []
        route_distance = 0.0
        route_load = 0

        while not routing.IsEnd(index):

            node = manager.IndexToNode(index)

            route.append(node)

            route_load += customers[node]["demand"]

            next_index = solution.Value(
                routing.NextVar(index)
            )

            next_node = manager.IndexToNode(next_index)

            route_distance += euclidean_distance(
                customers[node],
                customers[next_node]
            )

            index = next_index

        route.append(0)

        total_distance += route_distance

        print()
        print(f"Vehicle {vehicle_id + 1}")
        print(f"Route    : {' -> '.join(map(str, route))}")
        print(f"Load     : {route_load}")
        print(f"Distance : {route_distance:.2f}")

    print()
    print("----------------------------------------")
    print(f"Vehicles used  : {used_vehicles}")
    print(f"Total distance : {total_distance:.2f}")
    print("----------------------------------------")


def main():

    if len(sys.argv) < 2:
        print(
            "Usage:\n"
            "python optimize_route.py "
            "<path-to-solomon-instance>"
        )
        return

    file_path = sys.argv[1]

    if not Path(file_path).exists():
        print(f"File not found: {file_path}")
        return

    data = read_solomon_file(file_path)

    print()
    print("Solomon instance loaded successfully.")
    print()

    solve_vrptw(data)


if __name__ == "__main__":
    main()