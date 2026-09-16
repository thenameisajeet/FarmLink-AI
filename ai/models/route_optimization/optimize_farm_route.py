import sys
import json

from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2


VEHICLE_CAPACITY_KG = {
    "TWO_WHEELER": 50,
    "CAR": 200,
    "VAN": 1000,
    "TRUCK": 10000
}


def main():

    data = json.load(sys.stdin)

    distance_matrix = data["distanceMatrix"]
    time_matrix = data["timeMatrix"]
    order_quantities = data["orderQuantities"]
    vehicle = data.get("vehicle", "CAR")

    node_count = len(distance_matrix)

    capacity = VEHICLE_CAPACITY_KG.get(
        vehicle,
        VEHICLE_CAPACITY_KG["CAR"]
    )

    manager = pywrapcp.RoutingIndexManager(
        node_count,
        1,
        0
    )

    routing = pywrapcp.RoutingModel(manager)


    def distance_callback(from_index, to_index):

        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)

        return int(
            round(
                distance_matrix[
                    from_node
                ][
                    to_node
                ] * 1000
            )
        )


    distance_index = routing.RegisterTransitCallback(
            distance_callback
        )

    routing.SetArcCostEvaluatorOfAllVehicles(
        distance_index
    )


    # ---------------------------------------------------------
    # VEHICLE CAPACITY CONSTRAINT
    # ---------------------------------------------------------

    def demand_callback(from_index):

        from_node = manager.IndexToNode(
            from_index
        )

        # Node 0 = driver's current location.
        # Destination nodes 1..N correspond to orders.
        if from_node == 0:
            return 0

        return int(
            round(
                order_quantities[
                    from_node - 1
                ]
            )
        )


    demand_index = routing.RegisterUnaryTransitCallback(
            demand_callback
        )

    routing.AddDimensionWithVehicleCapacity(
        demand_index,
        0,
        [capacity],
        True,
        "Capacity"
    )


    # ---------------------------------------------------------
    # SOLVER
    # ---------------------------------------------------------

    search_parameters = (
        pywrapcp.DefaultRoutingSearchParameters()
    )

    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )

    search_parameters.time_limit.seconds = 10


    solution = routing.SolveWithParameters(
        search_parameters
    )


    if solution is None:

        print(json.dumps({
            "success": False,
            "message":
                f"No feasible route found for "
                f"{vehicle} with capacity "
                f"{capacity} kg"
        }))

        return


    index = routing.Start(0)

    route = []

    total_distance = 0
    total_time = 0
    total_quantity = 0


    while not routing.IsEnd(index):

        node = manager.IndexToNode(index)

        route.append(node)

        next_index = solution.Value(
            routing.NextVar(index)
        )

        next_node = manager.IndexToNode(
            next_index
        )

        total_distance += (
            distance_matrix[node][next_node]
        )

        total_time += (
            time_matrix[node][next_node]
        )

        if node > 0:

            total_quantity += (
                order_quantities[node - 1]
            )

        index = next_index


    route.append(
        manager.IndexToNode(index)
    )


    print(json.dumps({

        "success": True,

        "route": route,

        "totalDistanceKm":
            round(total_distance, 2),

        "totalTimeMinutes":
            round(total_time / 60, 1),

        "vehicle":
            vehicle,

        "vehicleCapacityKg":
            capacity,

        "totalQuantityKg":
            total_quantity

    }))


if __name__ == "__main__":
    main()